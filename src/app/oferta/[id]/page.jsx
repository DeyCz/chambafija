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

  const whatsappMessage = [
    `🚨 *${job.titulo}*`,
    '',
    `🏢 ${job.empresa}`,
    `📍 ${job.ubicacion || 'Cerro de Pasco'}`,
    `💰 ${job.sueldo || 'A tratar'}`,
    '',
    `📲 *Postula aquí:*`,
    shareUrl,
    '',
    `🔎 *ChambaFija*`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  const esEstado = job.tipo === 'Estado';

  return (
    <div className="bg-[#F4F7FB] text-[#0B132B] min-h-screen font-sans selection:bg-[#06D6A0] selection:text-[#0B132B]">
      {/* HEADER */}
      <header className="bg-[#0B132B]/95 backdrop-blur-xl text-white sticky top-0 z-40 border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(11,19,43,0.5)]">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <a href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
              <img
                src="/logo.png"
                alt="Chamba Fija Pasco"
                className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            <span className="text-[10px] bg-white/10 text-[#06D6A0] px-2.5 py-1 rounded-full border border-[#06D6A0]/30 font-extrabold whitespace-nowrap tracking-wide">
              Pasco 🏔️
            </span>
          </div>

          <Link
            href="/"
            className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-2xl font-extrabold transition-all whitespace-nowrap"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div
          className={`bg-white rounded-3xl w-full p-6 sm:p-10 relative overflow-hidden shadow-[0_14px_40px_-12px_rgba(11,19,43,0.1)] border ${
            job.esVip
              ? 'border-amber-400/90 ring-2 ring-amber-400/20'
              : 'border-slate-200/90'
          }`}
        >
          {/* Franja superior decorativa */}
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{
              backgroundColor: job.esVip
                ? '#F59E0B'
                : esEstado
                ? '#1D4ED8'
                : '#06D6A0',
            }}
          />

          {/* ETIQUETAS */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-5 pt-1">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider ${
                esEstado
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}
            >
              {esEstado
                ? '🏛️ Convocatoria Oficial del Estado'
                : '💼 Sector Privado Local'}
            </span>

            {job.esVip && (
              <span className="text-[11px] font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
                ⭐ Destacado
              </span>
            )}
          </div>

          {/* CABECERA DE TÍTULO Y EMPRESA */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-200/80">
            {job.logo && (
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-1.5 shadow-2xs items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={job.logo}
                  alt={job.empresa || 'Empresa'}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight leading-tight mb-3">
                {job.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 font-bold">
                <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-[#0B132B] px-3 py-1.5 rounded-xl border border-slate-200/80">
                  🏢 {job.empresa}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200/80">
                  📍 {job.ubicacion || 'Cerro de Pasco'}
                </span>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="space-y-5 text-sm text-slate-700 mb-8">
            {esEstado ? (
              <>
                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-5 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>📋</span> Requisitos del Puesto
                  </div>
                  <div className="p-5 space-y-3 font-medium leading-relaxed">
                    <p>
                      <strong className="text-[#0B132B]">Número de vacantes:</strong>{' '}
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {job.vacantes || '1'}
                      </span>
                    </p>
                    {job.formacion && (
                      <p className="whitespace-pre-wrap">
                        <strong className="text-[#0B132B]">Formación Académica:</strong>
                        <br />
                        {job.formacion}
                      </p>
                    )}
                    {job.experiencia && (
                      <p className="whitespace-pre-wrap">
                        <strong className="text-[#0B132B]">Experiencia:</strong>
                        <br />
                        {job.experiencia}
                      </p>
                    )}
                    {job.especializacion && (
                      <p className="whitespace-pre-wrap">
                        <strong className="text-[#0B132B]">Cursos y/o programas:</strong>
                        <br />
                        {job.especializacion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-5 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>💼</span> Condiciones del Contrato
                  </div>
                  <div className="p-5 space-y-3 font-medium">
                    <p>
                      <strong className="text-[#0B132B]">Lugar de prestación:</strong>{' '}
                      {job.empresa}
                    </p>
                    <p>
                      <strong className="text-[#0B132B]">Remuneración:</strong>{' '}
                      <span className="text-emerald-600 font-extrabold text-base tabular-nums">
                        {job.sueldo
                          ? job.sueldo.toString().startsWith('S/')
                            ? job.sueldo
                            : `S/ ${job.sueldo}`
                          : 'A tratar'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-5 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>🗓️</span> ¿Cómo postular?
                  </div>
                  <div className="p-5 space-y-3 font-medium leading-relaxed">
                    <p>
                      <strong className="text-[#0B132B]">Plazo límite:</strong>{' '}
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200/70">
                        {job.fechaVencimiento
                          ? job.fechaVencimiento
                              .split('T')[0]
                              .split('-')
                              .reverse()
                              .join('/')
                          : 'Ver cronograma'}
                      </span>
                    </p>
                    <p className="whitespace-pre-wrap">
                      <strong className="text-[#0B132B]">Procedimiento:</strong>{' '}
                      {job.comoPostular ||
                        'Presentación de expediente según bases oficiales.'}
                    </p>
                  </div>
                </div>

                {/* BLOQUE DINÁMICO DE ENLACES OFICIALES */}
                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-5 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>🔗</span> Enlaces Oficiales y Bases del Concurso
                  </div>
                  <div className="p-5 space-y-2.5 font-medium">
                    {job.enlaceBases && (
                      <div>
                        <a
                          href={job.enlaceBases}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-4 py-2.5 rounded-xl font-extrabold transition-colors"
                        >
                          <span>👉</span>
                          <span>Ver Bases y Convocatoria Completa (PDF)</span>
                        </a>
                      </div>
                    )}

                    {job.enlacesExtras &&
                      job.enlacesExtras.map(
                        (link, idx) =>
                          link.url && (
                            <div key={idx}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-4 py-2.5 rounded-xl font-extrabold transition-colors"
                              >
                                <span>👉</span>
                                <span>{link.titulo || 'Ver enlace oficial'}</span>
                              </a>
                            </div>
                          )
                      )}

                    {!job.enlaceBases &&
                      (!job.enlacesExtras || job.enlacesExtras.length === 0) && (
                        <p className="text-slate-400 italic">
                          No hay enlaces externos registrados para este proceso.
                        </p>
                      )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3.5 gap-4">
                  <span className="text-slate-500 font-bold">
                    Remuneración ofrecida:
                  </span>
                  <span className="font-extrabold text-emerald-600 text-lg sm:text-xl tabular-nums text-right">
                    {job.sueldo || 'A tratar'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3.5 gap-4">
                  <span className="text-slate-500 font-bold">
                    Jornada / Modalidad:
                  </span>
                  <span className="font-bold text-[#0B132B] bg-white px-3.5 py-1 rounded-xl border border-slate-200/90 shadow-2xs text-right">
                    {job.modalidad}
                  </span>
                </div>

                <div className="pt-1">
                  <h4 className="font-extrabold text-[#0B132B] mb-2">
                    Descripción del Puesto:
                  </h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-200/70">
                    {job.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3.5 pt-6 border-t border-slate-200/80">
            {esEstado ? (
              <a
                href={job.enlaceBases}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-[#0B132B] hover:bg-[#162447] text-[#06D6A0] font-extrabold text-xs sm:text-sm py-4 px-5 rounded-2xl shadow-lg shadow-[#0B132B]/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                📄 Descargar Bases Oficiales (PDF)
              </a>
            ) : (
              <a
                href={`https://wa.me/51${job.contacto}?text=${encodeURIComponent(
                  `Hola, vi el anuncio de "${job.titulo}" en *ChambaFija*.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-[#06D6A0] hover:bg-emerald-400 text-[#0B132B] font-extrabold text-xs sm:text-sm py-4 px-5 rounded-2xl shadow-lg shadow-[#06D6A0]/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                📲 Contactar al Empleador por WhatsApp
              </a>
            )}

            {/* COMPARTIR */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-slate-100 hover:bg-slate-200/80 text-[#0B132B] border border-slate-200/90 font-extrabold text-xs sm:text-sm py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              📤 Compartir por WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}