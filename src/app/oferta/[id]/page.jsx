import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// =========================================================
// UTILIDADES DE FECHAS Y ETIQUETAS AUTOMÁTICAS
// =========================================================
const formatTimeStr = (hora) => {
  if (!hora) return '11:59 PM';
  const [h, m = '00'] = String(hora).split(':');
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return '11:59 PM';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${m} ${ampm}`;
};

const formatDateRange = (inicio, fin, hora) => {
  const formatD = (d) => {
    if (!d) return '';
    const value = String(d).split('T')[0];
    return value.includes('-') ? value.split('-').reverse().join('/') : value;
  };

  const horaFormateada = formatTimeStr(hora);

  if (inicio && fin && inicio !== fin) {
    return `Del ${formatD(inicio)} al ${formatD(fin)} (${horaFormateada})`;
  }
  if (fin) {
    return `${formatD(fin)} (${horaFormateada})`;
  }
  return 'Ver cronograma en las bases';
};

const formatearFechaPub = (fechaISO) => {
  if (!fechaISO) return 'Recientemente';
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return 'Recientemente';
  return fecha.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const esOfertaReciente = (job) => {
  let timestamp = 0;
  if (job.createdAt) {
    const parsed = new Date(job.createdAt).getTime();
    if (!Number.isNaN(parsed)) timestamp = parsed;
  } else if (job.fechaPublicacion) {
    const parsed = new Date(job.fechaPublicacion).getTime();
    if (!Number.isNaN(parsed)) timestamp = parsed;
  }
  if (!timestamp) return false;
  const horas = (Date.now() - timestamp) / (1000 * 60 * 60);
  return horas >= 0 && horas <= 36;
};

const obtenerEstadoCierre = (job) => {
  if (!job.fechaVencimiento) return null;
  const partes = String(job.fechaVencimiento).split('T')[0].split('-').map(Number);
  if (partes.length !== 3) return null;

  const [year, month, day] = partes;
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const inicioVenc = new Date(year, month - 1, day).getTime();
  if (Number.isNaN(inicioVenc)) return null;

  const dias = Math.round((inicioVenc - inicioHoy) / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return {
      texto: '🔴 Finalizado',
      clases: 'bg-rose-100 text-rose-800 border border-rose-300',
    };
  }
  if (dias === 0) {
    return {
      texto: '🔥 ¡Cierra hoy!',
      clases: 'bg-rose-600 text-white border border-rose-700 animate-pulse',
    };
  }
  if (dias === 1) {
    return {
      texto: '⏳ Cierra mañana',
      clases: 'bg-amber-100 text-amber-900 border border-amber-300',
    };
  }
  if (dias === 2) {
    return {
      texto: '⏳ Cierra pronto',
      clases: 'bg-amber-50 text-amber-800 border border-amber-200',
    };
  }
  return null;
};

// =========================================================
// CONFIGURACIÓN DE CLASIFICADOS
// =========================================================
const categoriasClasificados = {
  'Locales en alquiler': { icono: '🏪', color: '#2563EB', fondo: '#EFF6FF', borde: '#BFDBFE' },
  'Viviendas en alquiler': { icono: '🏠', color: '#059669', fondo: '#ECFDF5', borde: '#A7F3D0' },
  Vehículos: { icono: '🚗', color: '#DC2626', fondo: '#FEF2F2', borde: '#FECACA' },
  Servicios: { icono: '🛠️', color: '#7C3AED', fondo: '#F5F3FF', borde: '#DDD6FE' },
  Ventas: { icono: '🏷️', color: '#D97706', fondo: '#FFFBEB', borde: '#FDE68A' },
  Otros: { icono: '📌', color: '#475569', fondo: '#F8FAFC', borde: '#CBD5E1' },
};

const obtenerCamposClasificado = (job) => {
  const pares = [
    ['🏪 Tipo de local', job.tipoLocal],
    ['🏠 Tipo de vivienda', job.tipoVivienda],
    ['📐 Área / Medida', job.area],
    ['🚪 Ambientes', job.ambientes],
    ['🛏️ Dormitorios', job.dormitorios],
    ['🚿 Baños', job.banos],
    ['🚗 Cochera', job.cochera],
    ['🛋️ Amoblado', job.amoblado],
    ['💡 Servicios incluidos', job.serviciosIncluidos],
    ['🔐 Garantía', job.garantia],
    ['🚗 Tipo de vehículo', job.tipoVehiculo],
    ['🏷️ Marca', job.marca || job.marcaProducto],
    ['🚘 Modelo', job.modelo],
    ['📅 Año', job.anio],
    ['🛣️ Kilometraje', job.kilometraje],
    ['⛽ Combustible', job.combustible],
    ['⚙️ Transmisión', job.transmision],
    ['🎨 Color', job.colorVehiculo],
    ['🛠️ Servicio', job.tipoServicio],
    ['💻 Modalidad', job.modalidadServicio],
    ['📍 Zona de atención', job.zonaAtencion],
    ['📦 Producto', job.producto],
    ['✨ Estado', job.estadoProducto],
    ['🔢 Cantidad', job.cantidad],
  ];
  return pares.filter(([, valor]) => valor !== undefined && valor !== null && String(valor).trim() !== '');
};

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
  const entidad =
    job.tipo === 'Clasificado'
      ? job.categoriaClasificado || 'Anuncio Clasificado'
      : job.empresa || 'Anuncio Local';

  return {
    title: `${job.titulo} en ${entidad} | ChambaFija`,

    description:
      `📍 ${job.ubicacion || 'Cerro de Pasco'} | ` +
      `💰 ${job.sueldo || 'A tratar'} | ` +
      `Modalidad: ${job.modalidad || 'Directo'}.`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: 'article',
      url,
      siteName: 'ChambaFija',
      title: `🚨 ${job.titulo} - ${entidad}`,
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
      title: `${job.titulo} - ${entidad}`,
      description: `Oportunidad en ${job.ubicacion || 'Cerro de Pasco'}.`,
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

  const esEstado = job.tipo === 'Estado';
  const esClasificado = job.tipo === 'Clasificado';
  const configClasificado =
    categoriasClasificados[job.categoriaClasificado] || categoriasClasificados.Otros;

  const reciente = esOfertaReciente(job);
  const estadoCierre = obtenerEstadoCierre(job);
  const verificado = !esEstado && job.verificado !== false;

  const sueldoFormateado = job.sueldo
    ? String(job.sueldo).startsWith('S/') ||
      String(job.sueldo).toLowerCase().includes('tratar')
      ? job.sueldo
      : `S/ ${job.sueldo}`
    : 'A tratar';

  const shareUrl = `https://www.chambafija.com/oferta/${id}`;
  const nombreEntidad = esClasificado
    ? job.categoriaClasificado || 'Anuncio Clasificado'
    : job.empresa || 'Empresa Local';

  const whatsappMessage = [
    `🚨 *${job.titulo}*`,
    '',
    `🏢 ${nombreEntidad}`,
    `📍 ${job.ubicacion || 'Cerro de Pasco'}`,
    `💰 ${sueldoFormateado}`,
    '',
    `📲 *Mira los requisitos y postula aquí:*`,
    shareUrl,
    '',
    `🔎 *ChambaFija Pasco*`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const contactosLimpios = job.contacto
    ? String(job.contacto)
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const enlacesExtrasValidos = Array.isArray(job.enlacesExtras)
    ? job.enlacesExtras.filter((l) => l && l.url && String(l.url).trim() !== '')
    : [];

  const camposClasificado = esClasificado ? obtenerCamposClasificado(job) : [];

  return (
    <div className="bg-[#F4F7FB] text-[#0B132B] min-h-screen flex flex-col justify-between font-sans selection:bg-[#06D6A0] selection:text-[#0B132B]">
      {/* =====================================================
          HEADER STICKY RESPONSIVE
          ===================================================== */}
      <header className="bg-[#0B132B]/95 backdrop-blur-xl text-white sticky top-0 z-40 border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(11,19,43,0.5)]">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
              <img
                src="/logo.png"
                alt="Chamba Fija Pasco"
                className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <span className="text-[10px] bg-white/10 text-[#06D6A0] px-2.5 py-1 rounded-full border border-[#06D6A0]/30 font-extrabold whitespace-nowrap tracking-wide">
              Pasco 🏔️
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-[#06D6A0] border border-[#06D6A0]/30 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl font-extrabold transition-all flex items-center gap-1.5"
              title="Compartir oferta por WhatsApp"
            >
              <span>📤</span>
              <span className="hidden sm:inline">Compartir</span>
            </a>

            <Link
              href="/"
              className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-extrabold transition-all whitespace-nowrap"
            >
              ← Ver más ofertas
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENIDO PRINCIPAL
          ===================================================== */}
      <main className="max-w-3xl mx-auto px-3.5 sm:px-4 py-6 sm:py-10 w-full flex-grow space-y-6">
        <article
          className={`bg-white rounded-3xl w-full p-5 sm:p-9 relative overflow-hidden shadow-[0_14px_40px_-12px_rgba(11,19,43,0.1)] border ${
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
                : esClasificado
                ? configClasificado.color
                : '#06D6A0',
            }}
          />

          {/* FILA 1: INSIGNIAS Y ETIQUETAS AUTOMÁTICAS */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider"
                style={
                  esClasificado
                    ? {
                        backgroundColor: configClasificado.fondo,
                        color: configClasificado.color,
                        border: `1px solid ${configClasificado.borde}`,
                      }
                    : esEstado
                    ? {
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                      }
                    : {
                        backgroundColor: '#ECFDF5',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                      }
                }
              >
                {esEstado
                  ? '🏛️ Convocatoria del Estado'
                  : esClasificado
                  ? `${configClasificado.icono} ${job.categoriaClasificado || 'Clasificado'}`
                  : '💼 Empleo Local'}
              </span>

              {verificado && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ✅ Verificado
                </span>
              )}

              {reciente && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full">
                  🕒 Reciente
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {estadoCierre && (
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full ${estadoCierre.clases}`}
                >
                  {estadoCierre.texto}
                </span>
              )}

              {job.esVip && (
                <span className="text-[10px] sm:text-[11px] font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  ⭐ Destacado
                </span>
              )}
            </div>
          </div>

          {/* FILA 2: CABECERA CON LOGO VISIBLE EN MÓVIL Y PC + TÍTULO */}
          <div className="flex items-start gap-3.5 sm:gap-4 mb-6 pb-6 border-b border-slate-200/80">
            {!esClasificado && (
              <div className="shrink-0">
                {job.logo ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200/90 p-1.5 shadow-2xs flex items-center justify-center overflow-hidden">
                    <img
                      src={job.logo}
                      alt={job.empresa || 'Empresa'}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold ${
                      esEstado
                        ? 'bg-blue-50 border-blue-100 text-blue-700'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}
                  >
                    {esEstado ? '🏛️' : '🏢'}
                  </div>
                )}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight leading-snug mb-3 break-words">
                {job.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-bold">
                {!esClasificado && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-[#0B132B] px-3 py-1.5 rounded-xl border border-slate-200/80 break-words">
                    🏢 {job.empresa || 'Anuncio Local'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200/80">
                  📍 {job.ubicacion || 'Cerro de Pasco'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-semibold px-1">
                  📅 Publicado: {formatearFechaPub(job.fechaPublicacion || job.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* FILA 3: TARJETAS DE RESUMEN RÁPIDO */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mb-6">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mb-0.5">
                💰 {esClasificado ? 'Precio' : 'Remuneración'}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 tabular-nums break-words">
                {sueldoFormateado}
              </span>
            </div>

            {!esClasificado ? (
              <>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                    📋 Modalidad
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#0B132B] break-words">
                    {job.modalidad || 'No especificada'}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3.5 flex sm:block items-center justify-between">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-800 sm:mb-0.5">
                    👥 Vacantes / Plazas
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-blue-700 tabular-nums">
                    {job.vacantes || '1'} {Number(job.vacantes) === 1 ? 'plaza' : 'plazas'}
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                  📍 Ubicación
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0B132B] break-words">
                  {job.ubicacion || 'Pasco'}
                </span>
              </div>
            )}
          </div>

          {/* =====================================================
              CUERPO DETALLADO SEGÚN TIPO DE OFERTA
              ===================================================== */}
          <div className="space-y-5 text-xs sm:text-sm text-slate-700 mb-8">
            {esEstado ? (
              <>
                {/* REQUISITOS */}
                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-4 sm:px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>📋</span> Requisitos del Puesto
                  </div>
                  <div className="p-4 sm:p-5 space-y-3.5 font-medium leading-relaxed">
                    {job.formacion && (
                      <div>
                        <strong className="text-[#0B132B] block mb-1">
                          🎓 Formación Académica:
                        </strong>
                        <p className="whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/70">
                          {job.formacion}
                        </p>
                      </div>
                    )}
                    {job.experiencia && (
                      <div>
                        <strong className="text-[#0B132B] block mb-1">
                          💼 Experiencia:
                        </strong>
                        <p className="whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/70">
                          {job.experiencia}
                        </p>
                      </div>
                    )}
                    {job.especializacion && (
                      <div>
                        <strong className="text-[#0B132B] block mb-1">
                          📚 Cursos y/o programas de especialización:
                        </strong>
                        <p className="whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/70">
                          {job.especializacion}
                        </p>
                      </div>
                    )}
                    {job.descripcion && (
                      <div>
                        <strong className="text-[#0B132B] block mb-1">
                          📝 Información adicional:
                        </strong>
                        <p className="whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/70">
                          {job.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ¿CÓMO POSTULAR? */}
                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-4 sm:px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>🗓️</span> ¿Cómo postular?
                  </div>
                  <div className="p-4 sm:p-5 space-y-3 font-medium leading-relaxed">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[#0B132B]">Plazo para postular:</strong>
                      <span className="font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/80">
                        ⏳ {formatDateRange(job.fechaInicio, job.fechaVencimiento, job.horaVencimiento)}
                      </span>
                    </div>
                    <div>
                      <strong className="text-[#0B132B] block mb-1">Procedimiento:</strong>
                      <p className="whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/70">
                        {job.comoPostular || 'Presentación de expediente según bases oficiales.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ENLACES OFICIALES Y BASES */}
                <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <div className="bg-[#0B132B] text-white font-extrabold px-4 sm:px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>🔗</span> Enlaces Oficiales y Bases del Concurso
                  </div>
                  <div className="p-4 sm:p-5 space-y-2.5 font-medium">
                    {job.enlaceBases && (
                      <a
                        href={job.enlaceBases}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-4 py-3 rounded-xl font-extrabold transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span>📄</span>
                          <span className="truncate">
                            Ver Bases y Convocatoria Completa (PDF)
                          </span>
                        </span>
                        <span className="text-xs shrink-0">Abrir →</span>
                      </a>
                    )}

                    {enlacesExtrasValidos.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 px-4 py-3 rounded-xl font-extrabold transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span>👉</span>
                          <span className="truncate">
                            {link.titulo || `Ver documento oficial #${idx + 1}`}
                          </span>
                        </span>
                        <span className="text-xs shrink-0">Abrir →</span>
                      </a>
                    ))}

                    {!job.enlaceBases && enlacesExtrasValidos.length === 0 && (
                      <p className="text-slate-400 italic">
                        No hay enlaces externos registrados para este proceso.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : esClasificado ? (
              /* VISTA DE ANUNCIO CLASIFICADO */
              <div className="space-y-4">
                {camposClasificado.length > 0 && (
                  <div
                    className="p-4 sm:p-5 rounded-2xl border"
                    style={{
                      backgroundColor: `${configClasificado.fondo}70`,
                      borderColor: configClasificado.borde,
                    }}
                  >
                    <h2
                      className="text-xs font-extrabold uppercase tracking-wider mb-3"
                      style={{ color: configClasificado.color }}
                    >
                      {configClasificado.icono} Características del Anuncio
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {camposClasificado.map(([label, valor]) => (
                        <div
                          key={label}
                          className="bg-white p-3 rounded-xl border border-slate-200/80"
                        >
                          <span className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">
                            {label}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0B132B] break-words">
                            {String(valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-slate-200/90">
                  <h2 className="font-extrabold text-[#0B132B] mb-2">
                    Descripción Detallada:
                  </h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/70">
                    {job.descripcion || 'Contactar por WhatsApp para más detalles.'}
                  </p>
                </div>
              </div>
            ) : (
              /* VISTA DE EMPLEO LOCAL PRIVADO */
              <div className="bg-[#F8FAFC] p-4 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4">
                {job.experiencia && (
                  <div>
                    <h2 className="font-extrabold text-[#0B132B] mb-1.5">
                      💼 Experiencia o Requisitos:
                    </h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-200/70">
                      {job.experiencia}
                    </p>
                  </div>
                )}

                <div>
                  <h2 className="font-extrabold text-[#0B132B] mb-1.5">
                    📋 Descripción del Puesto:
                  </h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-200/70">
                    {job.descripcion || 'Comunícate directamente por WhatsApp para postular.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
              BOTONES DE ACCIÓN PRINCIPALES
              ===================================================== */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200/80">
            {esEstado ? (
              job.enlaceBases ? (
                <a
                  href={job.enlaceBases}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-[#0B132B] hover:bg-[#162447] text-[#06D6A0] font-extrabold text-xs sm:text-sm py-4 px-5 rounded-2xl shadow-lg shadow-[#0B132B]/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  📄 Descargar Bases Oficiales (PDF)
                </a>
              ) : null
            ) : contactosLimpios.length > 0 ? (
              <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
                {contactosLimpios.map((num, i) => {
                  const soloDigitos = num.replace(/\D/g, '');
                  const telefonoFinal = soloDigitos.startsWith('51')
                    ? soloDigitos
                    : `51${soloDigitos}`;
                  return (
                    <a
                      key={i}
                      href={`https://wa.me/${telefonoFinal}?text=${encodeURIComponent(
                        `Hola, vi el anuncio de "${job.titulo}" en *ChambaFija*.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center bg-[#06D6A0] hover:bg-emerald-400 text-[#0B132B] font-extrabold text-xs sm:text-sm py-4 px-5 rounded-2xl shadow-lg shadow-[#06D6A0]/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      📲{' '}
                      {contactosLimpios.length === 1
                        ? 'Contactar por WhatsApp'
                        : `WhatsApp #${i + 1} (${num})`}
                    </a>
                  );
                })}
              </div>
            ) : null}

            {/* BOTÓN COMPARTIR */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:w-auto text-center bg-slate-100 hover:bg-slate-200/80 text-[#0B132B] border border-slate-200/90 font-extrabold text-xs sm:text-sm py-4 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              📤 Compartir por WhatsApp
            </a>
          </div>
        </article>

        {/* BLOQUE DE POSTULACIÓN SEGURA */}
        <section className="bg-gradient-to-r from-[#0B132B] via-[#132246] to-[#0B132B] text-white rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 bg-[#06D6A0]/15 text-[#06D6A0] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#06D6A0]/30 uppercase tracking-wider">
              🛡️ Postulación 100% Segura
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              En ChambaFija nunca te pediremos dinero por postular
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toda postulación es directa con la empresa o mediante las bases oficiales de la entidad pública. No realices pagos adelantados por exámenes médicos o trámites.
            </p>
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto text-center shrink-0 bg-[#06D6A0] hover:bg-emerald-300 text-[#0B132B] text-xs font-extrabold px-5 py-3 rounded-xl transition-all"
          >
            🔎 Ver más empleos
          </Link>
        </section>
      </main>

      {/* =====================================================
          FOOTER CON CANALES OFICIALES
          ===================================================== */}
      <footer className="bg-[#0B132B] text-slate-400 text-xs px-4 py-10 text-center border-t border-slate-800/90 mt-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://whatsapp.com/channel/0029Vb8NSHbDJ6H4RX6Zqj25"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#06D6A0] hover:bg-emerald-300 text-[#0B132B] font-extrabold py-2.5 px-5 rounded-xl transition-all"
            >
              📲 Unirme al Canal de WhatsApp
            </a>
            <a
              href="https://t.me/Chamba_Fija"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-extrabold py-2.5 px-5 rounded-xl transition-all"
            >
              ✈️ Unirme al Canal de Telegram
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 ChambaFija · Región Pasco. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}