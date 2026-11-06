import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

const TARGET_URL = 'https://www.convocatoriasdetrabajo.com/buscar-trabajos-en-PASCO-19.html';
const DOC_REF = 'monitor_pasco_estado';

function limpiarTextoHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Acepta ÚNICAMENTE URLs directas de convocatorias y descarta botones de compartir en redes
function normalizarUrlConvocatoria(rawHref) {
  if (!rawHref) return null;
  const limpio = String(rawHref).trim();

  if (
    /facebook\.com|linkedin\.com|whatsapp\.com|wa\.me|twitter\.com|x\.com|t\.me|telegram|sharer|shareArticle|mailto:/i.test(
      limpio
    )
  ) {
    return null;
  }

  try {
    const parsed = new URL(limpio, 'https://www.convocatoriasdetrabajo.com');

    if (!parsed.hostname.endsWith('convocatoriasdetrabajo.com')) {
      return null;
    }

    if (!/^\/oportunidad-laboral-[^/]+\.html$/i.test(parsed.pathname)) {
      return null;
    }

    return `https://www.convocatoriasdetrabajo.com${parsed.pathname}`;
  } catch {
    return null;
  }
}

function esTextoIgnorable(texto) {
  if (!texto) return true;
  const t = texto.toLowerCase().trim();
  const bloqueados = [
    'facebook',
    'linkedin',
    'whatsapp',
    'twitter',
    'x',
    'telegram',
    'compartir',
    'más información',
    'mas informacion',
    'ver más',
    'ver mas',
    'ver convocatoria',
    'leer más',
  ];
  return bloqueados.includes(t) || t.length < 5;
}

async function enviarAlertaCelular(mensaje) {
  const resultados = { whatsapp: false, telegram: false };

  const phone = process.env.ADMIN_WHATSAPP_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (phone && apiKey) {
    try {
      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        phone
      )}&text=${encodeURIComponent(mensaje)}&apikey=${encodeURIComponent(apiKey)}`;
      const resWa = await fetch(waUrl, { cache: 'no-store' });
      resultados.whatsapp = resWa.ok;
    } catch (err) {
      console.error('Error enviando alerta CallMeBot:', err);
    }
  }

  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      const resTg = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: mensaje,
          disable_web_page_preview: true,
        }),
      });
      resultados.telegram = resTg.ok;
    } catch (err) {
      console.error('Error enviando alerta Telegram:', err);
    }
  }

  return resultados;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const enviarNotificacion = searchParams.get('notify') === '1';

    const response = await fetch(TARGET_URL, {
      cache: 'no-store',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`El portal externo respondió con estado ${response.status}`);
    }

    const html = await response.text();
    const textoPlanoPagina = limpiarTextoHtml(html);

    // 1. Extraer enlaces reales de convocatorias (sin redes sociales)
    const regexEnlaces = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const mapaOfertas = new Map();

    let match;
    while ((match = regexEnlaces.exec(html)) !== null) {
      const urlValida = normalizarUrlConvocatoria(match[1]);
      if (!urlValida) continue;

      const textoAnchor = limpiarTextoHtml(match[2]);
      const ignorable = esTextoIgnorable(textoAnchor);

      // Si el texto del enlace era un botón genérico, ignorarlo salvo que aún no exista la URL
      const existente = mapaOfertas.get(urlValida);
      if (!existente) {
        if (!ignorable) {
          mapaOfertas.set(urlValida, {
            url: urlValida,
            titulo: textoAnchor,
            esGenerico: false,
          });
        } else {
          // Respaldo legible a partir del slug de la URL por si la tarjeta no tenía otro texto
          const slug = urlValida
            .split('/oportunidad-laboral-')[1]
            ?.replace(/-\d+\.html$/i, '')
            ?.replace(/-/g, ' ')
            ?.toUpperCase();
          mapaOfertas.set(urlValida, {
            url: urlValida,
            titulo: slug || 'Convocatoria en Pasco',
            esGenerico: true,
          });
        }
      } else if (!ignorable && (existente.esGenerico || textoAnchor.length > existente.titulo.length)) {
        mapaOfertas.set(urlValida, {
          url: urlValida,
          titulo: textoAnchor,
          esGenerico: false,
        });
      }
    }

    const ofertasActuales = Array.from(mapaOfertas.values()).map(({ url, titulo }) => ({
      url,
      titulo,
    }));

    // 2. Extraer el contador limpio sobre texto plano (soporta etiquetas HTML intermedias)
    const matchContador =
      textoPlanoPagina.match(/Hay\s+(\d+)\s+vacante/i) ||
      textoPlanoPagina.match(/(\d+)\s+vacante\(s\)\s+de\s+empleo/i) ||
      textoPlanoPagina.match(/(\d+)\s+vacantes?\s+(?:de\s+empleo|en\s+pasco|disponibles?)/i);

    const contadorPortal = matchContador
      ? parseInt(matchContador[1], 10)
      : ofertasActuales.length;

    // 3. Comparar contra historial en Firebase (limpiando cualquier red social previa)
    const docSnap = await db.collection('system').doc(DOC_REF).get();
    const estadoPrevio = docSnap.exists ? docSnap.data() : null;

    const urlsLimpiasPrevias = (estadoPrevio?.urlsConocidas || [])
      .map(normalizarUrlConvocatoria)
      .filter(Boolean);
    const urlsVistas = new Set(urlsLimpiasPrevias);

    const pendientesPreviasLimpias = (estadoPrevio?.nuevasPendientes || []).filter(
      (item) => normalizarUrlConvocatoria(item?.url) && !esTextoIgnorable(item?.titulo)
    );

    const recienDetectadas = estadoPrevio
      ? ofertasActuales.filter((item) => !urlsVistas.has(item.url))
      : [];

    const mapaPendientes = new Map();
    [...recienDetectadas, ...pendientesPreviasLimpias].forEach((item) => {
      const urlLimpia = normalizarUrlConvocatoria(item?.url);
      if (urlLimpia) {
        mapaPendientes.set(urlLimpia, { url: urlLimpia, titulo: item.titulo });
      }
    });
    const nuevasPendientes = Array.from(mapaPendientes.values());

    const todasLasUrls = Array.from(
      new Set([...urlsVistas, ...ofertasActuales.map((o) => o.url)])
    ).slice(-300);

    const ahoraISO = new Date().toISOString();

    await db.collection('system').doc(DOC_REF).set(
      {
        contadorActual: contadorPortal,
        contadorAnterior: estadoPrevio?.contadorActual ?? contadorPortal,
        totalEnlacesPagina: ofertasActuales.length,
        urlsConocidas: todasLasUrls,
        nuevasPendientes,
        ultimaRevision: ahoraISO,
      },
      { merge: true }
    );

    let alertaEnviada = null;
    if (enviarNotificacion && recienDetectadas.length > 0) {
      const resumen = recienDetectadas
        .slice(0, 4)
        .map((c, i) => `${i + 1}. ${c.titulo}`)
        .join('\n');

      const textoAlerta =
        `🚨 *Radar ChambaFija Pasco*\n` +
        `Aparecieron *${recienDetectadas.length}* nueva(s) convocatoria(s) en Pasco (Contador actual: *${contadorPortal}* vacantes).\n\n` +
        `${resumen}\n\n` +
        `👉 Entra a tu Panel Admin para extraerlas en 1 clic.`;

      alertaEnviada = await enviarAlertaCelular(textoAlerta);
    }

    return NextResponse.json({
      success: true,
      contadorActual: contadorPortal,
      contadorAnterior: estadoPrevio?.contadorActual ?? contadorPortal,
      recienDetectadasCount: recienDetectadas.length,
      nuevasPendientes,
      ofertasActuales,
      ultimaRevision: ahoraISO,
      alertaEnviada,
    });
  } catch (error) {
    console.error('Error en monitor-pasco:', error);
    return NextResponse.json(
      { success: false, mensaje: error.message || 'Error al revisar portal externo.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await db.collection('system').doc(DOC_REF).set(
      { nuevasPendientes: [] },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}