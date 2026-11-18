import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const DEFAULT_CONFIG = {
  habilitado: true,
  modo: 'sesion', // 'sesion' | 'minutos' | 'siempre'
  cadaMinutos: 30,
  retrasoMs: 600,
  mostrarBarraAnunciate: true,
  intervaloPortadaMs: 5500,
};

const estaVigentePeru = (ad) => {
  if (!ad?.activo) return false;
  if (!ad?.imagen || String(ad.imagen).trim() === '') return false;
  if (!ad?.activoHasta) return true;

  const fechaString = String(ad.activoHasta).split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) return true;

  const limite = new Date(`${fechaString}T23:59:59-05:00`);
  return Number.isNaN(limite.getTime()) || Date.now() <= limite.getTime();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const esPublico = searchParams.get('publico') === '1';

    const [configSnap, popupSnap, portadaSnap] = await Promise.all([
      db.collection('configuracion').doc('popup_publicidad').get(),
      db.collection('popup_ads').get(),
      db.collection('portada_ads').get(),
    ]);

    const config = configSnap.exists
      ? { ...DEFAULT_CONFIG, ...configSnap.data() }
      : DEFAULT_CONFIG;

    let ads = [];
    popupSnap.forEach((doc) =>
      ads.push({ _id: doc.id, clics: 0, ...doc.data() })
    );
    ads.sort(
      (a, b) =>
        (new Date(b.createdAt || 0).getTime() || 0) -
        (new Date(a.createdAt || 0).getTime() || 0)
    );

    let portadaAds = [];
    portadaSnap.forEach((doc) =>
      portadaAds.push({ _id: doc.id, clics: 0, ...doc.data() })
    );
    portadaAds.sort((a, b) => {
      const ordenA = Number(a.orden) || 99;
      const ordenB = Number(b.orden) || 99;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return (
        (new Date(b.createdAt || 0).getTime() || 0) -
        (new Date(a.createdAt || 0).getTime() || 0)
      );
    });

    if (esPublico) {
      ads = ads.filter(estaVigentePeru);
      portadaAds = portadaAds.filter(estaVigentePeru);
    }

    return NextResponse.json(
      { success: true, config, ads, portadaAds },
      {
        headers: esPublico
          ? { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
          : { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    console.error('Error GET /api/popup:', error);
    return NextResponse.json(
      { success: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Registrar un clic en popup o banner de portada
    if (body.action === 'click') {
      const id = String(body.id || '').trim();
      if (!id) {
        return NextResponse.json(
          { success: false, mensaje: 'Falta ID del anuncio' },
          { status: 400 }
        );
      }

      const nombreColeccion =
        body.coleccion === 'portada' ? 'portada_ads' : 'popup_ads';

      await db.collection(nombreColeccion).doc(id).update({
        clics: FieldValue.increment(1),
        ultimoClic: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    // 2. Guardar configuración general
    if (body.action === 'config') {
      const nuevaConfig = {
        habilitado: Boolean(body.habilitado),
        modo: ['sesion', 'minutos', 'siempre'].includes(body.modo)
          ? body.modo
          : 'sesion',
        cadaMinutos: Math.max(1, Number(body.cadaMinutos) || 30),
        retrasoMs: Math.max(0, Number(body.retrasoMs) ?? 600),
        mostrarBarraAnunciate: body.mostrarBarraAnunciate !== false,
        intervaloPortadaMs: Math.max(2000, Number(body.intervaloPortadaMs) || 5500),
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection('configuracion')
        .doc('popup_publicidad')
        .set(nuevaConfig, { merge: true });

      return NextResponse.json({
        success: true,
        config: nuevaConfig,
        mensaje: 'Configuración guardada',
      });
    }

    const ahora = new Date().toISOString();

    // 3. Crear banner de portada
    if (body.coleccion === 'portada') {
      const nuevoBanner = {
        activo: body.activo !== false,
        nombre: String(body.nombre || '').trim(),
        rubro: String(body.rubro || '').trim(),
        promo: String(body.promo || '').trim(),
        imagen: String(body.imagen || '').trim(),
        imagenMovil: String(body.imagenMovil || '').trim(),
        whatsapp: String(body.whatsapp || '').trim(),
        mensaje: String(body.mensaje || '').trim(),
        enlace: String(body.enlace || '').trim(),
        activoHasta: String(body.activoHasta || '').trim(),
        orden: Number(body.orden) || 1,
        clics: 0,
        ultimoClic: '',
        createdAt: ahora,
        updatedAt: ahora,
      };

      const docRef = await db.collection('portada_ads').add(nuevoBanner);
      return NextResponse.json(
        { success: true, id: docRef.id, mensaje: 'Banner de portada creado' },
        { status: 201 }
      );
    }

    // 4. Crear popup emergente
    const nuevoPopup = {
      activo: body.activo !== false,
      nombre: String(body.nombre || '').trim(),
      subtitulo: String(body.subtitulo || '').trim(),
      etiqueta: String(body.etiqueta || '🔥 Promo Rápida · Pasco').trim(),
      imagen: String(body.imagen || '').trim(),
      formato: ['auto', 'cuadrado', 'vertical', 'horizontal'].includes(body.formato)
        ? body.formato
        : 'cuadrado',
      textoBoton: String(body.textoBoton || '📲 Consultar por WhatsApp').trim(),
      whatsapp: String(body.whatsapp || '').trim(),
      mensaje: String(body.mensaje || '').trim(),
      enlace: String(body.enlace || '').trim(),
      activoHasta: String(body.activoHasta || '').trim(),
      clics: 0,
      ultimoClic: '',
      createdAt: ahora,
      updatedAt: ahora,
    };

    const docRef = await db.collection('popup_ads').add(nuevoPopup);
    return NextResponse.json(
      { success: true, id: docRef.id, mensaje: 'Anuncio emergente creado' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error POST /api/popup:', error);
    return NextResponse.json(
      { success: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, coleccion, reiniciarClics, ...resto } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, mensaje: 'Falta el ID del anuncio' },
        { status: 400 }
      );
    }

    const nombreColeccion =
      coleccion === 'portada' ? 'portada_ads' : 'popup_ads';

    // Reinicio explícito de contador
    if (reiniciarClics) {
      await db.collection(nombreColeccion).doc(id).update({
        clics: 0,
        ultimoClic: '',
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        mensaje: 'Contador reiniciado a 0',
      });
    }

    // Al editar campos del anuncio, nunca sobrescribimos los clics reales acumulados
    const actualizacion = {
      ...resto,
      updatedAt: new Date().toISOString(),
    };
    delete actualizacion._id;
    delete actualizacion.clics;
    delete actualizacion.ultimoClic;
    delete actualizacion.createdAt;

    if (coleccion === 'portada' && actualizacion.orden !== undefined) {
      actualizacion.orden = Number(actualizacion.orden) || 1;
    }

    Object.keys(actualizacion).forEach((k) => {
      if (actualizacion[k] === undefined) delete actualizacion[k];
    });

    await db.collection(nombreColeccion).doc(id).update(actualizacion);

    return NextResponse.json({
      success: true,
      mensaje: 'Anuncio actualizado correctamente',
    });
  } catch (error) {
    console.error('Error PUT /api/popup:', error);
    return NextResponse.json(
      { success: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const coleccion = searchParams.get('coleccion');

    if (!id) {
      return NextResponse.json(
        { success: false, mensaje: 'Falta el ID a eliminar' },
        { status: 400 }
      );
    }

    const nombreColeccion =
      coleccion === 'portada' ? 'portada_ads' : 'popup_ads';

    await db.collection(nombreColeccion).doc(id).delete();

    return NextResponse.json({
      success: true,
      mensaje: 'Anuncio eliminado',
    });
  } catch (error) {
    console.error('Error DELETE /api/popup:', error);
    return NextResponse.json(
      { success: false, mensaje: error.message },
      { status: 500 }
    );
  }
}