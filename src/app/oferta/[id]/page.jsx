import React from 'react';
import Link from 'next/link';

// Helper crítico para Next.js: Las consultas SSR necesitan URLs absolutas
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return 'https://www.chambafija.com'; // Tu dominio de producción
};

// =========================================================
// 1. GENERADOR DE METADATOS DINÁMICOS (SEO Y WHATSAPP)
// =========================================================
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    // Consultamos el endpoint exacto con la URL absoluta
    const res = await fetch(`${getBaseUrl()}/api/jobs/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Error fetching job data");
    
    const result = await res.json();
    const job = result.data; // Ahora recibimos directamente el objeto del empleo

    if (!job) {
      return { title: 'Oferta no encontrada | Chamba Fija Pasco' };
    }

    // Construcción de la tarjeta Open Graph
    return {
      title: `${job.titulo} en ${job.empresa} | Chamba Fija Pasco`,
      description: `📍 ${job.ubicacion} | 💰 ${job.sueldo || 'A tratar'} | Modalidad: ${job.modalidad}. Postula directamente y sin intermediarios.`,
      openGraph: {
        title: `🚨 ${job.titulo} - ${job.empresa}`,
        description: `📍 Ubicación: ${job.ubicacion} | 💰 Sueldo: ${job.sueldo || 'A tratar'}. Mira todos los requisitos y postula aquí.`,
        url: `https://www.chambafija.com/oferta/${id}`,
        siteName: 'Chamba Fija Pasco',
        images: [
          {
            url: 'https://www.chambafija.com/og-image.png', // URL absoluta vital para WhatsApp
            width: 1200,
            height: 630,
            alt: `Oferta Laboral: ${job.titulo}`,
          },
        ],
        locale: 'es_PE',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${job.titulo} - ${job.empresa}`,
        description: `Oferta laboral en ${job.ubicacion}. Postula ahora.`,
        images: ['https://www.chambafija.com/og-image.png'],
      },
    };
  } catch (error) {
    return { title: 'Oferta de Empleo | Chamba Fija Pasco' };
  }
}

// =========================================================
// 2. VISTA DE LA PÁGINA INDIVIDUAL DEL EMPLEO
// =========================================================
export default async function OfertaPage({ params }) {
  const { id } = params;
  
  let job = null;
  
  try {
    // Consulta absoluta al anuncio específico
    const res = await fetch(`${getBaseUrl()}/api/jobs/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const result = await res.json();
      job = result.data;
    }
  } catch (error) {
    console.error("Error cargando la oferta:", error);
  }

  // Pantalla de error si la oferta ya fue eliminada o no se encontró
  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Oferta no disponible</h1>
        <p className="text-slate-500 mb-6">Esta convocatoria ha expirado o fue eliminada por el anunciante.</p>
        <Link href="/" className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
          ⬅️ Volver a los empleos actuales
        </Link>
      </div>
    );
  }

  // Renderizado del diseño idéntico a tu modal
  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* CABECERA MINIMALISTA PARA NAVEGACIÓN */}
      <header className="bg-[#0F172A] text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-1.5 hover:scale-105 transition-transform">
            <span>Chamba</span><span className="text-[#FF6B00]">Fija</span>
          </Link>
          <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-colors font-semibold">
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL DE LA OFERTA */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200">
          
          {/* ETIQUETAS */}
          <div className="flex justify-between items-start mb-4">
            <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-lg ${job.tipo === 'Estado' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-[#FF6B00]'}`}>
              {job.tipo === 'Estado' ? '🏛️ Convocatoria Oficial del Estado' : '🏪 Sector Privado Local'}
            </span>
            {job.esVip && <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg">⭐ Destacado</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{job.titulo}</h1>
          <p className="text-sm text-slate-600 font-semibold mb-6 flex items-center gap-2">
            🏢 {job.empresa} <span className="text-slate-300">|</span> 📍 {job.ubicacion}
          </p>

          <div className="space-y-5 text-sm text-slate-700 mb-8">
            
            {/* VISTA PARA ESTADO */}
            {job.tipo === 'Estado' ? (
              <>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-blue-100/70 text-blue-900 font-bold px-5 py-3 border-b border-blue-200">📋 Requisitos Principales</div>
                  <div className="p-5 space-y-3">
                    <p><strong>Vacantes:</strong> {job.vacantes || '1'}</p>
                    {job.formacion && <p><strong>Formación Académica:</strong> {job.formacion}</p>}
                    {job.experiencia && <p><strong>Experiencia Requerida:</strong> {job.experiencia}</p>}
                    {job.especializacion && <p><strong>Cursos/Especialización:</strong> {job.especializacion}</p>}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-blue-100/70 text-blue-900 font-bold px-5 py-3 border-b border-blue-200">💼 Condiciones del contrato</div>
                  <div className="p-5 space-y-3">
                    <p><strong>Lugar de prestación:</strong> {job.lugarPrestacion || job.empresa}</p>
                    <p><strong>Remuneración:</strong> <span className="text-emerald-600 font-bold text-base">{job.sueldo || 'A tratar'}</span> ({job.modalidad})</p>
                    {job.fechaVencimiento && <p><strong>Vencimiento:</strong> <span className="text-rose-600 font-bold">{new Date(job.fechaVencimiento).toLocaleDateString()}</span></p>}
                  </div>
                </div>
              </>
            ) : (
              /* VISTA PARA PRIVADO */
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Remuneración ofrecida:</span>
                  <span className="font-extrabold text-emerald-600 text-lg">{job.sueldo || 'A tratar'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Jornada / Modalidad:</span>
                  <span className="font-bold text-slate-800">{job.modalidad}</span>
                </div>
                <div className="pt-2">
                  <h4 className="font-bold text-slate-800 mb-2">Descripción del Puesto:</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.descripcion}</p>
                </div>
              </div>
            )}

          </div>

          {/* BOTONES DE ACCIÓN FIJOS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            {job.tipo === 'Estado' ? (
              <a 
                href={job.enlaceBases} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1"
              >
                📄 Descargar Bases Oficiales (PDF)
              </a>
            ) : (
              <a 
                href={`https://wa.me/51${job.contacto}?text=Hola,%20vi%20el%20anuncio%20de%20${encodeURIComponent(job.titulo)}%20en%20ChambaFija`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                📲 Contactar al Empleador por WhatsApp
              </a>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}