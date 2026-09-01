import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';

// =========================================================
// OBTENER OFERTA DIRECTAMENTE DESDE FIREBASE
// =========================================================
async function getJob(id) {
  try {
    if (!id || id === 'undefined') {
      return null;
    }

    const docRef = await db.collection('jobs').doc(id).get();

    if (!docRef.exists) {
      return null;
    }

    return {
      _id: docRef.id,
      ...docRef.data(),
    };
  } catch (error) {
    console.error('Error obteniendo oferta:', error);
    return null;
  }
}

// =========================================================
// METADATA DINÁMICA PARA GOOGLE / WHATSAPP / FACEBOOK
// =========================================================
export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return {
      title: 'Oferta no encontrada | ChambaFija',
      description: 'Esta oferta laboral no está disponible.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const url = `https://www.chambafija.com/oferta/${id}`;

  return {
    title: `${job.titulo} en ${job.empresa} | ChambaFija`,

    description:
      `📍 ${job.ubicacion || 'Cerro de Pasco'} | ` +
      `💰 ${job.sueldo || 'A tratar'} | ` +
      `Modalidad: ${job.modalidad || 'No especificada'}.`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: 'article',
      url,
      siteName: 'ChambaFija',

      title: `🚨 ${job.titulo} - ${job.empresa}`,

      description:
        `📍 ${job.ubicacion || 'Cerro de Pasco'} | ` +
        `💰 ${job.sueldo || 'A tratar'}. ` +
        `Mira todos los requisitos y postula aquí.`,

      locale: 'es_PE',

      images: [
        {
          url: 'https://www.chambafija.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `${job.titulo} - ChambaFija`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${job.titulo} - ${job.empresa}`,
      description: `Oferta laboral en ${job.ubicacion || 'Cerro de Pasco'}.`,
      images: ['https://www.chambafija.com/og-image.png'],
    },
  };
}

// =========================================================
// PÁGINA INDIVIDUAL
// =========================================================
export default async function OfertaPage({ params }) {
  const { id } = await params;

  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  const shareUrl = `https://www.chambafija.com/oferta/${id}`;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-sans">

      {/* HEADER */}
      <header className="bg-[#0F172A] text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight"
          >
            <span>Chamba</span>
            <span className="text-[#FF6B00]">Fija</span>
          </Link>

          <Link
            href="/"
            className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-semibold"
          >
            Volver al inicio
          </Link>

        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        <div className="bg-white rounded-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200">

          {/* ETIQUETAS */}
          <div className="flex justify-between items-start mb-4">

            <span
              className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-lg ${
                job.tipo === 'Estado'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-orange-100 text-[#FF6B00]'
              }`}
            >
              {job.tipo === 'Estado'
                ? '🏛️ Convocatoria Oficial del Estado'
                : '🏪 Sector Privado Local'}
            </span>

            {job.esVip && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg">
                ⭐ Destacado
              </span>
            )}

          </div>

          {/* TITULO */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {job.titulo}
          </h1>

          <p className="text-sm text-slate-600 font-semibold mb-6">
            🏢 {job.empresa} | 📍 {job.ubicacion}
          </p>

          {/* INFORMACIÓN */}
          <div className="space-y-5 text-sm text-slate-700 mb-8">

            {job.tipo === 'Estado' ? (
              <>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">

                  <div className="bg-blue-100/70 text-blue-900 font-bold px-5 py-3 border-b border-blue-200">
                    📋 Requisitos Principales
                  </div>

                  <div className="p-5 space-y-3">

                    <p>
                      <strong>Vacantes:</strong> {job.vacantes || '1'}
                    </p>

                    {job.formacion && (
                      <p>
                        <strong>Formación Académica:</strong>{' '}
                        {job.formacion}
                      </p>
                    )}

                    {job.experiencia && (
                      <p>
                        <strong>Experiencia Requerida:</strong>{' '}
                        {job.experiencia}
                      </p>
                    )}

                    {job.especializacion && (
                      <p>
                        <strong>Cursos/Especialización:</strong>{' '}
                        {job.especializacion}
                      </p>
                    )}

                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">

                  <div className="bg-blue-100/70 text-blue-900 font-bold px-5 py-3 border-b border-blue-200">
                    💼 Condiciones del contrato
                  </div>

                  <div className="p-5 space-y-3">

                    <p>
                      <strong>Lugar de prestación:</strong>{' '}
                      {job.lugarPrestacion || job.empresa}
                    </p>

                    <p>
                      <strong>Remuneración:</strong>{' '}
                      <span className="text-emerald-600 font-bold text-base">
                        {job.sueldo || 'A tratar'}
                      </span>{' '}
                      ({job.modalidad})
                    </p>

                    {job.fechaVencimiento && (
                      <p>
                        <strong>Vencimiento:</strong>{' '}
                        <span className="text-rose-600 font-bold">
                          {new Date(job.fechaVencimiento).toLocaleDateString(
                            'es-PE'
                          )}
                        </span>
                      </p>
                    )}

                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">

                <div className="flex justify-between items-center border-b border-slate-200 pb-3">

                  <span className="text-slate-500">
                    Remuneración ofrecida:
                  </span>

                  <span className="font-extrabold text-emerald-600 text-lg">
                    {job.sueldo || 'A tratar'}
                  </span>

                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-3">

                  <span className="text-slate-500">
                    Jornada / Modalidad:
                  </span>

                  <span className="font-bold text-slate-800">
                    {job.modalidad}
                  </span>

                </div>

                <div className="pt-2">

                  <h4 className="font-bold text-slate-800 mb-2">
                    Descripción del Puesto:
                  </h4>

                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {job.descripcion}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">

            {job.tipo === 'Estado' ? (

              <a
                href={job.enlaceBases}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg"
              >
                📄 Descargar Bases Oficiales (PDF)
              </a>

            ) : (

              <a
                href={`https://wa.me/51${job.contacto}?text=${encodeURIComponent(
                  `Hola, vi el anuncio de "${job.titulo}" en ChambaFija.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg"
              >
                📲 Contactar al Empleador por WhatsApp
              </a>

            )}

            {/* COMPARTIR */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `🚨 *${job.titulo}*\n\n` +
                `🏢 ${job.empresa}\n` +
                `📍 ${job.ubicacion || 'Cerro de Pasco'}\n` +
                `💰 ${job.sueldo || 'A tratar'}\n\n` +
                `📲 Postula aquí:\n${shareUrl}\n\n` +
                `🔎 ChambaFija`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg"
            >
              📤 Compartir por WhatsApp
            </a>

          </div>

        </div>

      </main>

    </div>
  );
}