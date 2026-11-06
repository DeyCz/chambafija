import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

const TARGET_URL = 'https://www.convocatoriasdetrabajo.com/buscar-trabajos-en-PASCO-19.html';
const DOC_REF = 'monitor_pasco_estado';

function limpiarTextoHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function enviarAlertaCelular(mensaje) {
  const resultados = { whatsapp: false, telegram: false };

  // 1. Envío automático a tu WhatsApp personal vía CallMeBot (si configuraste variables en .env)
  const phone = process.env.ADMIN_WHATSAPP_PHONE; // Ej: 51967576214
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

  // 2. Respaldo gratuito e ilimitado por Bot de Telegram (Opcional en .env)
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

    // 1. Extraer el contador oficial ("Hay 29 vacante(s) de empleo del Sector Público")
    const matchContador = html.match(/Hay\s+(\d+)\s+vacante\(s\)/i);
    const contadorPortal = matchContador ? parseInt(matchContador[1], 10) : 0;

    // 2. Extraer cada enlace de convocatoria vigente en la página
    const regexEnlaces = /<a[^>]+href=["']([^"']*oportunidad-laboral-[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const mapaOfertas = new Map();

    let match;
    while ((match = regexEnlaces.exec(html)) !== null) {
      const rawHref = match[1].trim();
      const urlCompleta = rawHref.startsWith('http')
        ? rawHref
        : `https://www.convocatoriasdetrabajo.com/${rawHref.replace(/^\//, '')}`;

      const textoAnchor = limpiarTextoHtml(match[2]);
      const esGenerico =
        !textoAnchor ||
        textoAnchor.toLowerCase().includes('más información') ||
        textoAnchor.toLowerCase().includes('mas informacion');

      const existente = mapaOfertas.get(urlCompleta);
      if (!existente) {
        mapaOfertas.set(urlCompleta, {
          url: urlCompleta,
          titulo: esGenerico ? 'Convocatoria detectada en Pasco' : textoAnchor,
        });
      } else if (!esGenerico && textoAnchor.length > existente.titulo.length) {
        existente.titulo = textoAnchor;
      }
    }

    const ofertasActuales = Array.from(mapaOfertas.values());
    const docSnap = await db.collection('system').doc(DOC_REF).get();
    const estadoPrevio = docSnap.exists ? docSnap.data() : null;

    const urlsVistas = new Set(estadoPrevio?.urlsConocidas || []);
    const pendientesPrevias = Array.isArray(estadoPrevio?.nuevasPendientes)
      ? estadoPrevio.nuevasPendientes
      : [];

    // Detectar convocatorias que NO existían en la revisión anterior
    const recienDetectadas = estadoPrevio
      ? ofertasActuales.filter((item) => !urlsVistas.has(item.url))
      : [];

    // Unir pendientes que el admin aún no ha revisado con las recién salidas
    const mapaPendientes = new Map();
    [...recienDetectadas, ...pendientesPrevias].forEach((item) => {
      if (item?.url) mapaPendientes.set(item.url, item);
    });
    const nuevasPendientes = Array.from(mapaPendientes.values());

    // Actualizar memoria en Firebase
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

    // Si hay convocatorias nuevas y la llamada viene del vigilante automático (notify=1), avisar al celular
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

// Limpiar alertas pendientes cuando el administrador ya las revisó
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