'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ============================================================
   FORMATO DE FECHAS
   ============================================================ */

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

    if (!value.includes('-')) return value;

    return value.split('-').reverse().join('/');
  };

  const horaFormateada = formatTimeStr(hora);

  if (inicio && fin && inicio !== fin) {
    return (
      <>
        <span className="whitespace-nowrap">⏳ Del {formatD(inicio)} al</span>{' '}
        <span className="whitespace-nowrap">
          {formatD(fin)} ({horaFormateada})
        </span>
      </>
    );
  }

  if (fin) {
    return (
      <span className="whitespace-nowrap">
        ⏳ Vence: {formatD(fin)} - {horaFormateada}
      </span>
    );
  }

  return '';
};

/* ============================================================
   CATEGORÍAS DE CLASIFICADOS
   ============================================================ */

const categoriasClasificados = {
  'Locales en alquiler': {
    icono: '🏪',
    color: '#2563EB',
    fondo: '#EFF6FF',
    borde: '#BFDBFE',
  },
  'Viviendas en alquiler': {
    icono: '🏠',
    color: '#059669',
    fondo: '#ECFDF5',
    borde: '#A7F3D0',
  },
  Vehículos: {
    icono: '🚗',
    color: '#DC2626',
    fondo: '#FEF2F2',
    borde: '#FECACA',
  },
  Servicios: {
    icono: '🛠️',
    color: '#7C3AED',
    fondo: '#F5F3FF',
    borde: '#DDD6FE',
  },
  Ventas: {
    icono: '🏷️',
    color: '#D97706',
    fondo: '#FFFBEB',
    borde: '#FDE68A',
  },
  Otros: {
    icono: '📌',
    color: '#475569',
    fondo: '#F8FAFC',
    borde: '#CBD5E1',
  },
};

const getCategoriaConfig = (categoria) =>
  categoriasClasificados[categoria] || categoriasClasificados.Otros;

// ============================================================
// CONTADOR DE VACANTES
// ============================================================

const estaVigente = (job) => {
  if (!job.fechaVencimiento) return true;

  const fechaString = String(job.fechaVencimiento).split('T')[0];
  const partes = fechaString.split('-');

  if (partes.length !== 3) return true;

  const [year, month, day] = partes;

  let h = 23;
  let m = 59;

  if (job.horaVencimiento) {
    const [hours, minutes] = String(job.horaVencimiento).split(':');

    const horaNumero = parseInt(hours, 10);
    const minutoNumero = parseInt(minutes, 10);

    if (!Number.isNaN(horaNumero)) h = horaNumero;
    if (!Number.isNaN(minutoNumero)) m = minutoNumero;
  }

  const fechaExp = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    h,
    m,
    59
  );

  return Number.isNaN(fechaExp.getTime()) || new Date() <= fechaExp;
};

const obtenerNumeroVacantes = (valor) => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : 0;
  }

  const coincidencia = String(valor ?? '').trim().match(/^\d+/);

  if (!coincidencia) return 0;

  const numero = parseInt(coincidencia[0], 10);

  return numero > 0 ? numero : 0;
};

/* ============================================================
   PUBLICIDADES
   ============================================================

   AQUÍ AGREGAS LAS PUBLICIDADES.

   Google Drive:
   1. Sube la imagen a Drive.
   2. Compartir -> "Cualquier persona con el enlace".
   3. Copia el ID del archivo (ej: 1ABCDEF123456789) y colócalo en driveId.

   whatsapp: número PERUANO SIN +51 (Ejemplo: 967576214)
   ============================================================ */

const publicidades = [
  {
    id: 'publicidad-1',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_1',
    nombre: 'Publicidad 1',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
  {
    id: 'publicidad-2',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_2',
    nombre: 'Publicidad 2',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
  {
    id: 'publicidad-3',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_3',
    nombre: 'Publicidad 3',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
  {
    id: 'publicidad-4',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_4',
    nombre: 'Publicidad 4',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
  {
    id: 'publicidad-5',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_5',
    nombre: 'Publicidad 5',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
  {
    id: 'publicidad-6',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_6',
    nombre: 'Publicidad 6',
    whatsapp: '967576214',
    mensaje: 'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },
];

/* ============================================================
   COMPONENTE PUBLICIDAD
   ============================================================ */

const PublicidadCard = ({ publicidad }) => {
  const [error, setError] = useState(false);

  if (
    !publicidad ||
    !publicidad.activo ||
    !publicidad.driveId ||
    publicidad.driveId.startsWith('COLOCA_AQUI')
  ) {
    return null;
  }

  if (error) return null;

  const imagenUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
    publicidad.driveId
  )}&sz=w2000`;

  const numero = String(publicidad.whatsapp || '').replace(/\D/g, '');

  const whatsappUrl = numero
    ? `https://wa.me/51${numero}?text=${encodeURIComponent(
        publicidad.mensaje ||
          'Hola, vi su publicidad en ChambaFija y quisiera más información.'
      )}`
    : '#';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Publicidad de ${publicidad.nombre}`}
      className="group relative block w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-full h-[125px] sm:h-[165px] md:h-[195px] lg:h-[225px]">
        <img
          src={imagenUrl}
          alt={publicidad.nombre}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B132B]/75 via-[#0B132B]/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-[#0B132B]/85 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            📢 Espacio Patrocinado
          </span>
        </div>

        {numero && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1.5 bg-[#06D6A0] text-[#0B132B] text-[10px] sm:text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg transition-all duration-300 group-hover:bg-emerald-300 group-hover:scale-105">
              📲 Contactar ahora
            </span>
          </div>
        )}
      </div>
    </a>
  );
};

const PublicidadSection = ({ whatsappUrl }) => {
  const anunciosActivos = publicidades.filter(
    (publicidad) =>
      publicidad.activo &&
      publicidad.driveId &&
      !publicidad.driveId.startsWith('COLOCA_AQUI')
  );

  const hayPublicidad = anunciosActivos.length > 0;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-6 sm:mt-8">
      {hayPublicidad ? (
        <div className="w-full space-y-4">
          {anunciosActivos.map((publicidad) => (
            <PublicidadCard key={publicidad.id} publicidad={publicidad} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#132042] to-[#0B132B] border border-slate-800 shadow-[0_12px_32px_-12px_rgba(11,19,43,0.45)]">
          <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full bg-[#06D6A0]/15 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
              <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-[#06D6A0]/15 border border-[#06D6A0]/30 items-center justify-center text-2xl shadow-inner">
                📢
              </div>

              <div>
                <span className="inline-block text-[#06D6A0] text-[10px] font-extrabold uppercase tracking-widest mb-1">
                  Publicidad Local en Pasco
                </span>

                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight">
                  Haz que tu negocio llegue a miles de personas
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Anuncia tu empresa, servicio, local o emprendimiento en la portada de ChambaFija.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-[#06D6A0] hover:bg-emerald-300 text-[#0B132B] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#06D6A0]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              📲 Quiero anunciar
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================
   CAMPO CLASIFICADO
   ============================================================ */

const CampoClasificado = ({ label, valor, icono }) => {
  if (valor === undefined || valor === null || valor === '') {
    return null;
  }

  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
        {icono} {label}
      </span>

      <span className="text-xs font-bold text-[#0B132B] break-words">
        {String(valor)}
      </span>
    </div>
  );
};

/* ============================================================
   TÍTULO DE SECCIÓN
   ============================================================ */

const SectionTitle = ({ icon, title, subtitle, color = '#0B132B' }) => {
  return (
    <div className="mb-6 mt-10 first:mt-2 flex items-center justify-between border-b border-slate-200/80 pb-4">
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs flex-shrink-0 border"
          style={{
            backgroundColor: `${color}10`,
            borderColor: `${color}25`,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight leading-tight">
              {title}
            </h2>
            <span
              className="hidden sm:inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsResumen, setJobsResumen] = useState([]);

  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedJob, setSelectedJob] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  const searchInputRef = useRef(null);

  const numeroWhatsApp = '51967576214';

  const mensajePublicar =
    '¡Hola! ⚡ Quiero publicar un empleo en *Chamba Fija* y encontrar personal al toque 📲🔥';

  const whatsappUrl =
    `https://api.whatsapp.com/send?phone=${numeroWhatsApp}` +
    `&text=${encodeURIComponent(mensajePublicar)}`;

  // ============================================================
  // WHATSAPP PARA PUBLICIDAD
  // ============================================================

  const mensajePublicidad =
    '¡Hola! 📢 Quiero anunciar mi negocio en ChambaFija y quisiera conocer los espacios publicitarios disponibles.';

  const whatsappPublicidadUrl =
    `https://api.whatsapp.com/send?phone=${numeroWhatsApp}` +
    `&text=${encodeURIComponent(mensajePublicidad)}`;

  /* ==========================================================
     WHATSAPP VIP
     ========================================================== */

  const mensajeVIP =
    '¡Hola! ⭐ Quiero destacar mi negocio/anuncio en ChambaFija y quisiera conocer cómo puedo ser VIP. 📲🔥';

  const whatsappVIPUrl =
    `https://api.whatsapp.com/send?phone=${numeroWhatsApp}` +
    `&text=${encodeURIComponent(mensajeVIP)}`;

  /* ==========================================================
     OBTENER ANUNCIOS
     ========================================================== */

  const fetchJobs = async (tipoFiltro) => {
    setLoading(true);

    try {
      let queryVal = '';

      if (tipoFiltro === 'Empleos') {
        queryVal = '?tipo=Privado';
      } else if (tipoFiltro === 'Estado') {
        queryVal = '?tipo=Estado';
      } else if (tipoFiltro === 'Anuncios Clasificados') {
        queryVal = '?tipo=Clasificado';
      }

      const url =
        tipoFiltro === 'Todos' || tipoFiltro === 'Destacados'
          ? '/api/jobs'
          : `/api/jobs${queryVal}`;

      const res = await fetch(url, {
        cache: 'no-store',
      });

      const result = await res.json();

      if (result.success) {
        setJobs(Array.isArray(result.data) ? result.data : []);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filter);
  }, [filter]);

  // ============================================================
  // CARGAR DATOS PARA EL CONTADOR DE VACANTES
  // ============================================================

  useEffect(() => {
    let activo = true;

    const cargarResumen = async () => {
      try {
        const res = await fetch('/api/jobs', {
          cache: 'no-store',
        });

        const result = await res.json();

        if (activo && result.success) {
          setJobsResumen(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error('Error al cargar contador de vacantes:', error);
      }
    };

    cargarResumen();

    return () => {
      activo = false;
    };
  }, []);

  // ============================================================
  // SUMA TOTAL DE VACANTES ACTIVAS
  // ============================================================

  const resumenVacantes = useMemo(() => {
    const empleosActivos = jobsResumen.filter(estaVigente);

    const sumarVacantes = (tipo) => {
      return empleosActivos
        .filter((job) => job.tipo === tipo)
        .reduce((total, job) => {
          return total + obtenerNumeroVacantes(job.vacantes);
        }, 0);
    };

    return {
      estado: sumarVacantes('Estado'),
      locales: sumarVacantes('Privado'),
    };
  }, [jobsResumen]);

  /* ==========================================================
     FILTRADO
     ========================================================== */

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      /* ELIMINAR ANUNCIOS VENCIDOS */
      if (job.fechaVencimiento) {
        const fechaString = String(job.fechaVencimiento).split('T')[0];
        const partes = fechaString.split('-');

        if (partes.length === 3) {
          const [year, month, day] = partes;

          let h = 23;
          let m = 59;

          if (job.horaVencimiento) {
            const [hours, minutes] = String(job.horaVencimiento).split(':');
            const horaNumero = parseInt(hours, 10);
            const minutoNumero = parseInt(minutes, 10);

            if (!Number.isNaN(horaNumero)) h = horaNumero;
            if (!Number.isNaN(minutoNumero)) m = minutoNumero;
          }

          const fechaExp = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            h,
            m,
            59
          );

          if (!Number.isNaN(fechaExp.getTime()) && new Date() > fechaExp) {
            return false;
          }
        }
      }

      /* BÚSQUEDA */
      const texto = searchTerm.toLowerCase().trim();

      if (!texto) {
        if (filter === 'Destacados') return Boolean(job.esVip);
        if (filter === 'Empleos') return job.tipo === 'Privado';
        if (filter === 'Estado') return job.tipo === 'Estado';
        if (filter === 'Anuncios Clasificados') return job.tipo === 'Clasificado';
        return true;
      }

      const camposBusqueda = [
        job.titulo,
        job.empresa,
        job.ubicacion,
        job.formacion,
        job.experiencia,
        job.especializacion,
        job.categoriaClasificado,
        job.marca,
        job.modelo,
        job.producto,
        job.tipoServicio,
        job.tipoLocal,
        job.tipoVivienda,
        job.tipoVehiculo,
        job.marcaProducto,
        job.estadoProducto,
      ];

      const matchesSearch = camposBusqueda.some(
        (campo) => campo && String(campo).toLowerCase().includes(texto)
      );

      if (!matchesSearch) return false;

      /* FILTROS */
      if (filter === 'Destacados') return Boolean(job.esVip);
      if (filter === 'Empleos') return job.tipo === 'Privado';
      if (filter === 'Estado') return job.tipo === 'Estado';
      if (filter === 'Anuncios Clasificados') return job.tipo === 'Clasificado';

      return true;
    });
  }, [jobs, searchTerm, filter]);

  /* ==========================================================
     ORDENAMIENTO
     ========================================================== */

  const sortedJobs = useMemo(() => {
    const prioridadTipo = {
      Privado: 1,
      Estado: 2,
      Clasificado: 3,
    };

    const getTimestamp = (job) => {
      const posiblesFechas = [
        job.fechaPublicacion,
        job.createdAt,
        job.fechaInicio,
      ];

      for (const fecha of posiblesFechas) {
        if (!fecha) continue;
        const timestamp = new Date(fecha).getTime();
        if (!Number.isNaN(timestamp)) return timestamp;
      }

      return 0;
    };

    return [...filteredJobs].sort((a, b) => {
      const vipA = Boolean(a.esVip);
      const vipB = Boolean(b.esVip);

      if (vipA !== vipB) return vipA ? -1 : 1;

      const prioridadA = prioridadTipo[a.tipo] || 99;
      const prioridadB = prioridadTipo[b.tipo] || 99;

      if (prioridadA !== prioridadB) return prioridadA - prioridadB;

      return getTimestamp(b) - getTimestamp(a);
    });
  }, [filteredJobs]);

  /* ==========================================================
     AGRUPACIONES
     ========================================================== */

  const vipJobs = useMemo(
    () => sortedJobs.filter((job) => Boolean(job.esVip)),
    [sortedJobs]
  );

  const privateJobs = useMemo(
    () => sortedJobs.filter((job) => job.tipo === 'Privado' && !job.esVip),
    [sortedJobs]
  );

  const estadoJobs = useMemo(
    () => sortedJobs.filter((job) => job.tipo === 'Estado' && !job.esVip),
    [sortedJobs]
  );

  const clasificadosJobs = useMemo(
    () => sortedJobs.filter((job) => job.tipo === 'Clasificado' && !job.esVip),
    [sortedJobs]
  );

  const categoriasConAnuncios = useMemo(
    () =>
      Object.keys(categoriasClasificados).filter((categoria) =>
        clasificadosJobs.some(
          (job) => (job.categoriaClasificado || 'Otros') === categoria
        )
      ),
    [clasificadosJobs]
  );

  /* ==========================================================
     BUSCADOR + DESPLAZAMIENTO
     ========================================================== */

  const desplazarAResultados = () => {
    window.setTimeout(() => {
      const filtros = document.getElementById('filtros-anuncios');
      if (!filtros) return;

      const esMobile = window.innerWidth < 640;

      if (esMobile) {
        const headerOffset = 90;
        const top =
          filtros.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: 'smooth',
        });
      } else {
        filtros.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  const ejecutarBusqueda = () => {
    desplazarAResultados();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      ejecutarBusqueda();
    }
  };

  /* ==========================================================
     FORMATEAR FECHA
     ========================================================== */

  const formatearFechaPub = (fechaISO) => {
    if (!fechaISO) return 'Recientemente';

    const fecha = new Date(fechaISO);
    if (Number.isNaN(fecha.getTime())) return 'Recientemente';

    return fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /* ==========================================================
     DATOS CLASIFICADOS
     ========================================================== */

  const renderDatosClasificado = (job, modo = 'card') => {
    const categoria = job.categoriaClasificado || 'Otros';
    const datos = [];

    if (categoria === 'Locales en alquiler') {
      datos.push(
        <CampoClasificado key="tipoLocal" label="Tipo de local" valor={job.tipoLocal} icono="🏪" />,
        <CampoClasificado key="area" label="Área" valor={job.area} icono="📐" />,
        <CampoClasificado key="ambientes" label="Ambientes" valor={job.ambientes} icono="🚪" />,
        <CampoClasificado key="banos" label="Baños" valor={job.banos} icono="🚿" />,
        <CampoClasificado key="garantia" label="Garantía" valor={job.garantia} icono="🔐" />
      );
    } else if (categoria === 'Viviendas en alquiler') {
      datos.push(
        <CampoClasificado key="tipoVivienda" label="Tipo de vivienda" valor={job.tipoVivienda} icono="🏠" />,
        <CampoClasificado key="area" label="Área" valor={job.area} icono="📐" />,
        <CampoClasificado key="dormitorios" label="Dormitorios" valor={job.dormitorios} icono="🛏️" />,
        <CampoClasificado key="banos" label="Baños" valor={job.banos} icono="🚿" />,
        <CampoClasificado key="cochera" label="Cochera" valor={job.cochera} icono="🚗" />,
        <CampoClasificado key="amoblado" label="Amoblado" valor={job.amoblado} icono="🛋️" />,
        <CampoClasificado key="serviciosIncluidos" label="Servicios incluidos" valor={job.serviciosIncluidos} icono="💡" />,
        <CampoClasificado key="garantia" label="Garantía" valor={job.garantia} icono="🔐" />
      );
    } else if (categoria === 'Vehículos') {
      datos.push(
        <CampoClasificado key="tipoVehiculo" label="Tipo" valor={job.tipoVehiculo} icono="🚗" />,
        <CampoClasificado key="marca" label="Marca" valor={job.marca} icono="🏷️" />,
        <CampoClasificado key="modelo" label="Modelo" valor={job.modelo} icono="🚘" />,
        <CampoClasificado key="anio" label="Año" valor={job.anio} icono="📅" />,
        <CampoClasificado key="kilometraje" label="Kilometraje" valor={job.kilometraje} icono="🛣️" />,
        <CampoClasificado key="combustible" label="Combustible" valor={job.combustible} icono="⛽" />,
        <CampoClasificado key="transmision" label="Transmisión" valor={job.transmision} icono="⚙️" />,
        <CampoClasificado key="colorVehiculo" label="Color" valor={job.colorVehiculo} icono="🎨" />
      );
    } else if (categoria === 'Servicios') {
      datos.push(
        <CampoClasificado key="tipoServicio" label="Servicio" valor={job.tipoServicio} icono="🛠️" />,
        <CampoClasificado key="modalidadServicio" label="Modalidad" valor={job.modalidadServicio} icono="💻" />,
        <CampoClasificado key="zonaAtencion" label="Zona de atención" valor={job.zonaAtencion} icono="📍" />
      );
    } else if (categoria === 'Ventas') {
      datos.push(
        <CampoClasificado key="producto" label="Producto" valor={job.producto} icono="📦" />,
        <CampoClasificado key="marcaProducto" label="Marca" valor={job.marcaProducto} icono="🏷️" />,
        <CampoClasificado key="estadoProducto" label="Estado" valor={job.estadoProducto} icono="✨" />,
        <CampoClasificado key="cantidad" label="Cantidad" valor={job.cantidad} icono="🔢" />
      );
    } else {
      datos.push(
        <CampoClasificado key="area" label="Área / Medida" valor={job.area} icono="📐" />
      );
    }

    const items = datos.filter(Boolean);
    if (!items.length) return null;

    return (
      <div
        className={
          modo === 'modal'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
            : 'grid grid-cols-2 gap-3'
        }
      >
        {items}
      </div>
    );
  };

  /* ==========================================================
     TARJETA DE ANUNCIO
     ========================================================== */

  const JobCard = ({ job }) => {
    /* CLASIFICADOS */
    if (job.tipo === 'Clasificado') {
      const categoria = job.categoriaClasificado || 'Otros';
      const config = getCategoriaConfig(categoria);

      return (
        <div
          className={`group bg-white rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-10px_rgba(11,19,43,0.12)] ${
            job.esVip
              ? 'border-amber-400/90 ring-2 ring-amber-400/25 shadow-md'
              : 'border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(11,19,43,0.06)]'
          }`}
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ backgroundColor: job.esVip ? '#F59E0B' : config.color }}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pt-1">
              <span
                className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap"
                style={{
                  backgroundColor: config.fondo,
                  color: config.color,
                  border: `1px solid ${config.borde}`,
                }}
              >
                {config.icono} {categoria}
              </span>

              {job.esVip && (
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-2xs">
                  ⭐ Destacado
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-[#0B132B] mb-3.5 leading-snug group-hover:text-slate-700 transition-colors">
              {job.titulo}
            </h3>

            <div
              className="p-4 rounded-2xl border mb-4"
              style={{
                backgroundColor: `${config.fondo}90`,
                borderColor: config.borde,
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <CampoClasificado
                  label="Ubicación"
                  valor={job.ubicacion || 'Pasco'}
                  icono="📍"
                />
                <CampoClasificado
                  label="Precio"
                  valor={job.sueldo || 'A tratar'}
                  icono="💰"
                />
              </div>

              <div
                className="mt-3 pt-3 border-t"
                style={{ borderColor: config.borde }}
              >
                {renderDatosClasificado(job)}
              </div>
            </div>

            {job.descripcion && (
              <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2 leading-relaxed">
                {job.descripcion}
              </p>
            )}

            <p className="text-[11px] text-slate-400 font-semibold mb-5">
              📅 Publicado: {formatearFechaPub(job.fechaInicio || job.fechaPublicacion)}
            </p>
          </div>

          <button
            onClick={() => setSelectedJob(job)}
            className="w-full text-white text-xs font-extrabold py-3.5 rounded-2xl transition-all duration-300 shadow-sm hover:opacity-95 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
            style={{ backgroundColor: config.color }}
          >
            <span>📲 Ver detalles y contactar</span>
          </button>
        </div>
      );
    }

    /* EMPLEO / ESTADO */
    const esEstado = job.tipo === 'Estado';

    return (
      <div
        className={`group bg-white rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-10px_rgba(11,19,43,0.12)] ${
          job.esVip
            ? 'border-amber-400/90 bg-gradient-to-b from-amber-50/35 via-white to-white ring-2 ring-amber-400/25 shadow-md'
            : 'border-slate-200/90 hover:border-[#06D6A0]/60 shadow-[0_4px_20px_-4px_rgba(11,19,43,0.06)]'
        }`}
      >
        <div>
          {/* 1. BARRA SUPERIOR: TIPO A LA IZQUIERDA Y VENCIMIENTO / VIP A LA DERECHA */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${
                esEstado
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}
            >
              <span>{esEstado ? '🏛️' : '💼'}</span>
              <span>{esEstado ? 'Público' : 'Empleo Local'}</span>
            </span>

            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {job.esVip && (
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs">
                  ⭐ VIP
                </span>
              )}

              {esEstado && job.fechaVencimiento && (
                <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-xl leading-tight text-right">
                  {formatDateRange(
                    job.fechaInicio,
                    job.fechaVencimiento,
                    job.horaVencimiento
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. IDENTIDAD DE LA ENTIDAD / EMPRESA (ANCHO COMPLETO SIN CORTES) */}
          <div className="flex items-center gap-3.5 mb-3.5 pb-3.5 border-b border-slate-100">
            {job.logo ? (
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 p-1.5 shadow-2xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={job.logo}
                  alt={job.empresa || 'Empresa'}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  esEstado
                    ? 'bg-blue-50 border-blue-100 text-blue-700'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}
              >
                {esEstado ? '🏛️' : '💼'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-[13px] text-slate-700 font-extrabold leading-snug break-words line-clamp-2">
                {job.empresa || 'Empresa'}
              </p>

              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="shrink-0">📍</span>
                <span className="truncate">{job.ubicacion || 'Pasco'}</span>
              </p>
            </div>
          </div>

          {/* 3. TÍTULO DEL PUESTO */}
          <h3 className="text-base sm:text-[17px] font-extrabold text-[#0B132B] mb-4 leading-snug group-hover:text-emerald-700 transition-colors">
            {job.titulo}
          </h3>

          {/* 4. RESUMEN DE CONDICIONES */}
          <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5 mb-5">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-500 font-semibold">Remuneración</span>
              <span className="font-extrabold text-emerald-600 text-sm text-right tabular-nums">
                {job.sueldo || 'A tratar'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs gap-2 pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 font-semibold">Modalidad</span>
              <span className="font-bold text-[#0B132B] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200/90 truncate max-w-[165px] shadow-2xs">
                {job.modalidad || 'No especificada'}
              </span>
            </div>

            {job.vacantes && (
              <div className="flex justify-between items-center text-xs gap-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-semibold">Vacantes / Plazas</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 tabular-nums">
                  {job.vacantes}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setSelectedJob(job)}
          className={`w-full text-xs font-extrabold py-3.5 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
            esEstado
              ? 'bg-[#0B132B] hover:bg-[#162447] text-white shadow-[#0B132B]/15'
              : 'bg-[#0B132B] hover:bg-emerald-600 text-white hover:shadow-emerald-600/20'
          }`}
        >
          <span>{esEstado ? '📄 VER CONVOCATORIA' : '📲 Ver Detalles y Postular'}</span>
        </button>
      </div>
    );
  };

    /* EMPLEO / ESTADO */
    const esEstado = job.tipo === 'Estado';

    return (
      <div
        className={`group bg-white rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-10px_rgba(11,19,43,0.12)] ${
          job.esVip
            ? 'border-amber-400/90 bg-gradient-to-b from-amber-50/35 via-white to-white ring-2 ring-amber-400/25 shadow-md'
            : 'border-slate-200/90 hover:border-[#06D6A0]/60 shadow-[0_4px_20px_-4px_rgba(11,19,43,0.06)]'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-3.5 gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              {job.logo ? (
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 p-1 shadow-2xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={job.logo}
                    alt={job.empresa || 'Empresa'}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                    esEstado
                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
                >
                  {esEstado ? '🏛️' : '💼'}
                </div>
              )}

              <div className="min-w-0">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    esEstado
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/70'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                  }`}
                >
                  {esEstado ? '🏛️ Público' : '💼 Empleo Local'}
                </span>

                <p className="text-xs text-slate-600 font-bold mt-1 whitespace-normal break-words leading-snug">
                  {job.empresa || 'Empresa'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {job.esVip && (
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                  ⭐ VIP
                </span>
              )}

              {esEstado && job.fechaVencimiento && (
                <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-xl flex flex-col items-end leading-tight text-right">
                  {formatDateRange(
                    job.fechaInicio,
                    job.fechaVencimiento,
                    job.horaVencimiento
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-base sm:text-[17px] font-extrabold text-[#0B132B] mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors">
            {job.titulo}
          </h3>

          <p className="text-xs text-slate-500 font-semibold mb-4 flex items-center gap-1.5">
            <span>📍</span>
            <span className="truncate">{job.ubicacion || 'Pasco'}</span>
          </p>

          <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5 mb-5">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-500 font-semibold">Remuneración</span>
              <span className="font-extrabold text-emerald-600 text-sm text-right tabular-nums">
                {job.sueldo || 'A tratar'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs gap-2 pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 font-semibold">Modalidad</span>
              <span className="font-bold text-[#0B132B] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200/90 truncate max-w-[165px] shadow-2xs">
                {job.modalidad || 'No especificada'}
              </span>
            </div>

            {job.vacantes && (
              <div className="flex justify-between items-center text-xs gap-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-semibold">Vacantes / Plazas</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 tabular-nums">
                  {job.vacantes}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setSelectedJob(job)}
          className={`w-full text-xs font-extrabold py-3.5 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
            esEstado
              ? 'bg-[#0B132B] hover:bg-[#162447] text-white shadow-[#0B132B]/15'
              : 'bg-[#0B132B] hover:bg-emerald-600 text-white hover:shadow-emerald-600/20'
          }`}
        >
          <span>{esEstado ? '📄 VER CONVOCATORIA' : '📲 Ver Detalles y Postular'}</span>
        </button>
      </div>
    );
  };

  /* ==========================================================
     GRID
     ========================================================== */

  const CardsGrid = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    );
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="bg-[#F4F7FB] text-[#0B132B] min-h-screen flex flex-col justify-between font-sans selection:bg-[#06D6A0] selection:text-[#0B132B]">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="bg-[#0B132B]/95 backdrop-blur-xl text-white sticky top-0 z-40 shadow-[0_10px_30px_-10px_rgba(11,19,43,0.5)] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3.5">
          {/* LOGO */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <img
                src="/logo.png"
                alt="Chamba Fija Pasco"
                className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </a>

            <span className="text-[10px] bg-white/10 text-[#06D6A0] px-2.5 py-1 rounded-full ml-2.5 border border-[#06D6A0]/30 font-extrabold whitespace-nowrap tracking-wide">
              Pasco 🏔️
            </span>
          </div>

          {/* BUSCADOR */}
          <div className="w-full sm:w-[430px] relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              🔍
            </span>

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar empleo, entidad, local, vehículo..."
              className="w-full pl-11 pr-12 py-3 text-sm rounded-2xl bg-[#131F42]/90 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] focus:border-transparent focus:bg-[#0F1936] transition-all shadow-inner"
            />

            <button
              type="button"
              onClick={ejecutarBusqueda}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#06D6A0] text-[#0B132B] flex items-center justify-center hover:bg-emerald-300 active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Buscar"
            >
              🔎
            </button>
          </div>

          {/* PUBLICAR */}
          <div className="w-full sm:w-auto flex justify-end">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-gradient-to-r from-[#06D6A0] to-emerald-400 hover:from-emerald-400 hover:to-[#06D6A0] text-[#0B132B] text-xs font-extrabold px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-[#06D6A0]/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              💬 Publicar Anuncio
            </a>
          </div>
        </div>
      </header>

      {/* ======================================================
          HERO
          ====================================================== */}

      <section
        className="relative bg-cover bg-[center_bottom_55%] overflow-hidden bg-[#0B132B] text-white py-16 sm:py-20 px-4 text-center shadow-lg border-b border-slate-800"
        style={{
          backgroundImage: "url('/portadav2.png')",
        }}
      >
        {/* Capa de contraste elegante sobre la portada */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/80 via-[#0B132B]/70 to-[#0B132B]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,214,160,0.16)_0,transparent_60%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <span className="bg-[#0B132B]/80 text-[#06D6A0] text-xs font-extrabold px-4 py-1.5 rounded-full border border-[#06D6A0]/35 inline-flex items-center gap-2 shadow-md backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#06D6A0] animate-ping" />
            Empleos, convocatorias y clasificados al instante
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
            Encuentra de todo en{' '}
            <span className="text-[#06D6A0]">PASCO</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-medium leading-relaxed">
            Conectando negocios locales, procesos del Estado y anuncios
            clasificados de forma directa y sin intermediarios.
          </p>
        </div>
      </section>

      {/* ====================================================
          PUBLICIDAD
          ==================================================== */}

      {!loading && <PublicidadSection whatsappUrl={whatsappPublicidadUrl} />}

      {/* ======================================================
          CONTADOR DE VACANTES
          ====================================================== */}

      <section className="max-w-6xl mx-auto px-4 pt-8 pb-2 w-full">
        <div className="text-center mb-5">
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Vacantes laborales disponibles hoy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Oportunidades activas verificadas en la región Pasco
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 max-w-3xl mx-auto">
          {/* ESTADO */}
          <div className="relative overflow-hidden bg-white border border-blue-200/80 rounded-3xl p-4 sm:p-6 shadow-[0_6px_24px_-6px_rgba(29,78,216,0.1)] hover:shadow-[0_12px_28px_-6px_rgba(29,78,216,0.18)] transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/5 pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
                🏛️
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#0B132B]">
                Sector Estado
              </span>
            </div>

            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 tabular-nums tracking-tight">
              {resumenVacantes.estado.toLocaleString('es-PE')}
            </p>

            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-1">
              Plazas públicas vigentes
            </p>
          </div>

          {/* EMPLEOS LOCALES */}
          <div className="relative overflow-hidden bg-white border border-emerald-200/80 rounded-3xl p-4 sm:p-6 shadow-[0_6px_24px_-6px_rgba(5,150,105,0.1)] hover:shadow-[0_12px_28px_-6px_rgba(5,150,105,0.18)] transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#06D6A0]/10 pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                💼
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#0B132B]">
                Empleos Locales
              </span>
            </div>

            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tabular-nums tracking-tight">
              {resumenVacantes.locales.toLocaleString('es-PE')}
            </p>

            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-1">
              Puestos privados activos
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          FILTROS
          ====================================================== */}

      <nav
        id="filtros-anuncios"
        className="max-w-6xl mx-auto px-4 py-7 w-full flex flex-wrap gap-2.5 sm:gap-3 items-center justify-center scroll-mt-24"
      >
        {[
          'Todos',
          'Empleos',
          'Estado',
          'Anuncios Clasificados',
          'Destacados',
        ].map((filtro) => {
          const activo = filter === filtro;
          return (
            <button
              key={filtro}
              onClick={() => {
                setFilter(filtro);

                window.setTimeout(() => {
                  const filtros = document.getElementById('filtros-anuncios');
                  if (filtros) {
                    filtros.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }, 50);
              }}
              className={`text-xs px-5 py-3 rounded-2xl font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activo
                  ? 'bg-[#0B132B] text-white shadow-lg shadow-[#0B132B]/20 ring-2 ring-[#06D6A0]/60 -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <span>
                {filtro === 'Todos'
                  ? '🔍 Todos'
                  : filtro === 'Empleos'
                  ? '💼 Empleos'
                  : filtro === 'Estado'
                  ? '🏛️ Estado'
                  : filtro === 'Anuncios Clasificados'
                  ? '📢 Clasificados'
                  : '⭐ Destacados'}
              </span>
              {activo && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ======================================================
          CONTENIDO
          ====================================================== */}

      <main
        id="resultados-anuncios"
        className="max-w-6xl mx-auto px-4 pb-24 w-full flex-grow scroll-mt-24"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 h-68 animate-pulse flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <div className="w-20 h-4 bg-slate-200 rounded-full" />
                      <div className="w-32 h-3 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                  <div className="w-full h-5 bg-slate-200 rounded-lg" />
                  <div className="w-full h-20 bg-slate-100 rounded-2xl" />
                </div>

                <div className="w-full h-11 bg-slate-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 py-20 px-6 text-center max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-3xl">
              🔎
            </div>

            <p className="text-lg font-extrabold text-[#0B132B]">
              No se encontraron anuncios activos
            </p>

            <p className="text-xs sm:text-sm text-slate-500">
              Intenta cambiar la categoría seleccionada o buscar con otra palabra clave.
            </p>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('Todos');

                window.setTimeout(() => {
                  desplazarAResultados();
                }, 100);
              }}
              className="text-xs bg-[#0B132B] hover:bg-slate-800 text-[#06D6A0] px-6 py-3.5 rounded-2xl font-extrabold shadow-md cursor-pointer transition-all"
            >
              Restablecer búsqueda y filtros
            </button>
          </div>
        ) : (
          <div>
            {/* =================================================
                TODOS
                ================================================= */}

            {filter === 'Todos' && (
              <>
                {/* VIP */}
                {vipJobs.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="⭐"
                      title="Anuncios Destacados"
                      subtitle="Negocios y convocatorias con visibilidad prioritaria en Pasco"
                      color="#D97706"
                    />

                    <CardsGrid items={vipJobs} />

                    {/* CTA VIP */}
                    <div className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-amber-50 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                      <div className="text-center sm:text-left">
                        <p className="text-sm sm:text-base font-extrabold text-[#0B132B]">
                          ⭐ ¿Quieres que tu anuncio aparezca primero?
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          Fija tu oferta o negocio en la sección VIP y multiplica tus contactos.
                        </p>
                      </div>

                      <a
                        href={whatsappVIPUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center bg-[#0B132B] hover:bg-slate-800 text-[#06D6A0] text-xs font-extrabold px-6 py-3.5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 shrink-0"
                      >
                        📲 Quiero ser VIP
                      </a>
                    </div>
                  </section>
                )}

                {/* EMPLEOS */}
                {privateJobs.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="💼"
                      title="Empleos Locales"
                      subtitle="Empresas y negocios contratando personal en Pasco"
                      color="#059669"
                    />
                    <CardsGrid items={privateJobs} />
                  </section>
                )}

                {/* ESTADO */}
                {estadoJobs.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="🏛️"
                      title="Convocatorias del Estado"
                      subtitle="Procesos CAS, 728, 276 y locación en entidades públicas"
                      color="#1D4ED8"
                    />
                    <CardsGrid items={estadoJobs} />
                  </section>
                )}

                {/* CLASIFICADOS */}
                {categoriasConAnuncios.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="📢"
                      title="Anuncios Clasificados"
                      subtitle="Alquileres, vehículos, ventas y servicios directos en Pasco"
                      color="#7C3AED"
                    />

                    {categoriasConAnuncios.map((categoria) => {
                      const config = getCategoriaConfig(categoria);
                      const anunciosCategoria = clasificadosJobs.filter(
                        (job) =>
                          (job.categoriaClasificado || 'Otros') === categoria
                      );

                      return (
                        <div key={categoria} className="mb-10 last:mb-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs"
                              style={{
                                backgroundColor: config.fondo,
                                border: `1px solid ${config.borde}`,
                              }}
                            >
                              {config.icono}
                            </div>

                            <div>
                              <h3
                                className="text-base sm:text-lg font-extrabold leading-tight"
                                style={{ color: config.color }}
                              >
                                {categoria}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-semibold">
                                {anunciosCategoria.length}{' '}
                                {anunciosCategoria.length === 1
                                  ? 'anuncio disponible'
                                  : 'anuncios disponibles'}
                              </p>
                            </div>
                          </div>

                          <CardsGrid items={anunciosCategoria} />
                        </div>
                      );
                    })}
                  </section>
                )}
              </>
            )}

            {/* =================================================
                DESTACADOS
                ================================================= */}

            {filter === 'Destacados' && vipJobs.length > 0 && (
              <>
                <SectionTitle
                  icon="⭐"
                  title="Anuncios Destacados"
                  subtitle="Dale la máxima visibilidad a tu negocio en ChambaFija"
                  color="#D97706"
                />

                <CardsGrid items={vipJobs} />

                <div className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-amber-50 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="text-center sm:text-left">
                    <p className="text-sm sm:text-base font-extrabold text-[#0B132B]">
                      ⭐ Haz que tu negocio aparezca entre los destacados
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Aumenta la visibilidad de tu anuncio y llega a más clientes hoy.
                    </p>
                  </div>

                  <a
                    href={whatsappVIPUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center bg-[#0B132B] hover:bg-slate-800 text-[#06D6A0] text-xs font-extrabold px-6 py-3.5 rounded-2xl shadow-md transition-all shrink-0"
                  >
                    📲 Quiero ser VIP
                  </a>
                </div>
              </>
            )}

            {/* =================================================
                EMPLEOS
                ================================================= */}

            {filter === 'Empleos' && sortedJobs.length > 0 && (
              <>
                <SectionTitle
                  icon="💼"
                  title="Empleos Locales"
                  subtitle="Oportunidades laborales disponibles en el sector privado"
                  color="#059669"
                />
                <CardsGrid items={sortedJobs} />
              </>
            )}

            {/* =================================================
                ESTADO
                ================================================= */}

            {filter === 'Estado' && sortedJobs.length > 0 && (
              <>
                <SectionTitle
                  icon="🏛️"
                  title="Convocatorias del Estado"
                  subtitle="Procesos de selección vigentes en entidades públicas"
                  color="#1D4ED8"
                />
                <CardsGrid items={sortedJobs} />
              </>
            )}

            {/* =================================================
                CLASIFICADOS
                ================================================= */}

            {filter === 'Anuncios Clasificados' && (
              <>
                <SectionTitle
                  icon="📢"
                  title="Anuncios Clasificados"
                  subtitle="Explora alquileres, vehículos, ventas y servicios en Pasco"
                  color="#7C3AED"
                />

                {categoriasConAnuncios.map((categoria) => {
                  const config = getCategoriaConfig(categoria);
                  const anunciosCategoria = sortedJobs.filter(
                    (job) =>
                      (job.categoriaClasificado || 'Otros') === categoria
                  );

                  if (anunciosCategoria.length === 0) return null;

                  return (
                    <div key={categoria} className="mb-10 last:mb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs"
                          style={{
                            backgroundColor: config.fondo,
                            border: `1px solid ${config.borde}`,
                          }}
                        >
                          {config.icono}
                        </div>

                        <div>
                          <h3
                            className="text-base sm:text-lg font-extrabold leading-tight"
                            style={{ color: config.color }}
                          >
                            {categoria}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {anunciosCategoria.length}{' '}
                            {anunciosCategoria.length === 1
                              ? 'anuncio disponible'
                              : 'anuncios disponibles'}
                          </p>
                        </div>
                      </div>

                      <CardsGrid items={anunciosCategoria} />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </main>

      {/* ======================================================
          MODAL DETALLE
          ====================================================== */}

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedJob(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative max-h-[90vh] flex flex-col animate-modal">
            {/* CERRAR */}
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 text-slate-500 hover:text-[#0B132B] text-sm font-bold bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* ETIQUETA TIPO */}
            {(() => {
              const config =
                selectedJob.tipo === 'Clasificado'
                  ? getCategoriaConfig(
                      selectedJob.categoriaClasificado || 'Otros'
                    )
                  : null;

              return (
                <div className="pr-12 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider"
                    style={
                      selectedJob.tipo === 'Clasificado'
                        ? {
                            backgroundColor: config.fondo,
                            color: config.color,
                            border: `1px solid ${config.borde}`,
                          }
                        : selectedJob.tipo === 'Estado'
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
                    {selectedJob.esVip && '⭐ VIP · '}
                    {selectedJob.tipo === 'Estado'
                      ? '🏛️ Convocatoria Oficial del Estado'
                      : selectedJob.tipo === 'Clasificado'
                      ? `${config.icono} ${
                          selectedJob.categoriaClasificado || 'Otros'
                        }`
                      : '💼 Empleo Privado Local'}
                  </span>
                </div>
              );
            })()}

            {/* TÍTULO */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] mb-1.5 leading-tight pr-8">
              {selectedJob.tipo === 'Clasificado'
                ? selectedJob.titulo
                : `${selectedJob.empresa || 'Empresa'}: ${selectedJob.titulo}`}
            </h3>

            {/* UBICACIÓN */}
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-5 flex items-center gap-1.5">
              <span>📍</span>
              <span>{selectedJob.ubicacion || 'Pasco'}</span>
            </p>

            {/* CONTENIDO SCROLLABLE */}
            <div className="overflow-y-auto pr-1.5 space-y-4 mb-6 text-xs sm:text-[13px] text-slate-700">
              {/* ESTADO */}
              {selectedJob.tipo === 'Estado' ? (
                <>
                  <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-extrabold px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>📋</span> Requisitos del Puesto
                    </div>

                    <div className="p-4 space-y-3 font-medium leading-relaxed">
                      <p>
                        <strong className="text-[#0B132B]">Número de vacantes:</strong>{' '}
                        <span className="font-bold text-blue-700">{selectedJob.vacantes || '1'}</span>
                      </p>

                      {selectedJob.formacion && (
                        <p className="whitespace-pre-wrap">
                          <strong className="text-[#0B132B]">Formación Académica:</strong>
                          <br />
                          {selectedJob.formacion}
                        </p>
                      )}

                      {selectedJob.experiencia && (
                        <p className="whitespace-pre-wrap">
                          <strong className="text-[#0B132B]">Experiencia:</strong>
                          <br />
                          {selectedJob.experiencia}
                        </p>
                      )}

                      {selectedJob.especializacion && (
                        <p className="whitespace-pre-wrap">
                          <strong className="text-[#0B132B]">Cursos y/o programas:</strong>
                          <br />
                          {selectedJob.especializacion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-extrabold px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>💼</span> Condiciones del Contrato
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      <p>
                        <strong className="text-[#0B132B]">Lugar de prestación:</strong>{' '}
                        {selectedJob.empresa || selectedJob.ubicacion || 'Pasco'}
                      </p>

                      <p>
                        <strong className="text-[#0B132B]">Remuneración:</strong>{' '}
                        <span className="text-emerald-600 font-extrabold">
                          {selectedJob.sueldo
                            ? String(selectedJob.sueldo).startsWith('S/')
                              ? selectedJob.sueldo
                              : `S/ ${selectedJob.sueldo}`
                            : 'A tratar'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-extrabold px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>🗓️</span> ¿Cómo postular?
                    </div>

                    <div className="p-4 space-y-2.5 font-medium leading-relaxed">
                      <p>
                        <strong className="text-[#0B132B]">Plazo límite:</strong>{' '}
                        <span className="font-bold text-rose-600">
                          {selectedJob.fechaVencimiento
                            ? formatDateRange(
                                selectedJob.fechaInicio,
                                selectedJob.fechaVencimiento,
                                selectedJob.horaVencimiento
                              )
                            : 'Ver cronograma'}
                        </span>
                      </p>

                      <p className="whitespace-pre-wrap">
                        <strong className="text-[#0B132B]">Procedimiento:</strong>{' '}
                        {selectedJob.comoPostular ||
                          'Presentación de expediente según bases oficiales.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-extrabold px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>🔗</span> Enlaces Oficiales y Bases del Concurso
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      {selectedJob.enlaceBases && (
                        <p>
                          👉{' '}
                          <a
                            href={selectedJob.enlaceBases}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 hover:underline font-extrabold"
                          >
                            Ver Bases y Convocatoria Completa (PDF)
                          </a>
                        </p>
                      )}

                      {selectedJob.enlacesExtras &&
                        Array.isArray(selectedJob.enlacesExtras) &&
                        selectedJob.enlacesExtras.map(
                          (link, idx) =>
                            link?.url && (
                              <p key={idx}>
                                👉{' '}
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-extrabold"
                                >
                                  {link.titulo || 'Ver enlace oficial'}
                                </a>
                              </p>
                            )
                        )}

                      {!selectedJob.enlaceBases &&
                        (!selectedJob.enlacesExtras ||
                          selectedJob.enlacesExtras.length === 0) && (
                          <p className="text-slate-400 italic">
                            No hay enlaces externos registrados para este proceso.
                          </p>
                        )}
                    </div>
                  </div>
                </>
              ) : selectedJob.tipo === 'Clasificado' ? (
                (() => {
                  const categoria = selectedJob.categoriaClasificado || 'Otros';
                  const config = getCategoriaConfig(categoria);

                  return (
                    <div
                      className="p-5 rounded-2xl border space-y-5"
                      style={{
                        backgroundColor: `${config.fondo}80`,
                        borderColor: config.borde,
                      }}
                    >
                      <div
                        className="rounded-2xl p-4 bg-white border shadow-2xs"
                        style={{ borderColor: config.borde }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span
                              className="block text-[10px] uppercase font-extrabold mb-1"
                              style={{ color: config.color }}
                            >
                              💰 Precio
                            </span>
                            <span
                              className="font-extrabold text-lg"
                              style={{ color: config.color }}
                            >
                              {selectedJob.sueldo || 'A tratar'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                              📍 Ubicación
                            </span>
                            <span className="font-bold text-[#0B132B] text-sm">
                              {selectedJob.ubicacion || 'Pasco'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                              📅 Publicado el
                            </span>
                            <span className="font-bold text-[#0B132B] text-sm">
                              {formatearFechaPub(
                                selectedJob.fechaInicio ||
                                  selectedJob.fechaPublicacion
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4
                          className="font-extrabold mb-3 text-sm"
                          style={{ color: config.color }}
                        >
                          {config.icono} Características del anuncio
                        </h4>

                        <div
                          className="bg-white rounded-2xl border p-4 shadow-2xs"
                          style={{ borderColor: config.borde }}
                        >
                          {renderDatosClasificado(selectedJob, 'modal') || (
                            <p className="text-slate-400 italic">
                              No hay características adicionales registradas.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4
                          className="font-extrabold mb-2 text-sm"
                          style={{ color: config.color }}
                        >
                          Descripción Detallada:
                        </h4>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm bg-white p-4 rounded-2xl border border-slate-200/70">
                          {selectedJob.descripcion || 'Sin descripción adicional.'}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* EMPLEO PRIVADO */
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200/90 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 gap-4">
                    <span className="text-slate-500 font-bold">Remuneración</span>
                    <span className="font-extrabold text-emerald-600 text-base text-right">
                      {selectedJob.sueldo || 'A tratar'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 gap-4">
                    <span className="text-slate-500 font-bold">Modalidad</span>
                    <span className="font-bold text-[#0B132B] bg-white px-3 py-1 rounded-xl border border-slate-200 text-right">
                      {selectedJob.modalidad || 'No especificada'}
                    </span>
                  </div>

                  {selectedJob.experiencia && (
                    <div className="border-b border-slate-200/80 pb-3">
                      <h4 className="font-extrabold text-[#0B132B] mb-1.5">
                        Experiencia Requerida:
                      </h4>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedJob.experiencia}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-extrabold text-[#0B132B] mb-1.5">
                      Descripción del Puesto:
                    </h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedJob.descripcion || 'Sin descripción adicional.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-3.5 rounded-2xl transition-all cursor-pointer"
              >
                Cerrar
              </button>

              {selectedJob.tipo === 'Estado' ? (
                selectedJob.enlaceBases ? (
                  <a
                    href={selectedJob.enlaceBases}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-[#0B132B] hover:bg-slate-800 text-[#06D6A0] text-xs font-extrabold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    📄 Descargar Bases Oficiales
                  </a>
                ) : null
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                  {selectedJob.contacto &&
                    String(selectedJob.contacto)
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((num, i, arr) => (
                        <a
                          key={i}
                          href={`https://wa.me/51${num.replace(
                            /\D/g,
                            ''
                          )}?text=${encodeURIComponent(
                            `Hola, vi el anuncio de ${selectedJob.titulo} en ChambaFija`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex-1 bg-[#06D6A0] hover:bg-emerald-400 text-[#0B132B] text-xs font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center text-center gap-1.5"
                        >
                          📲{' '}
                          {arr.length === 1
                            ? 'Contactar por WhatsApp'
                            : `Contactar WhatsApp #${i + 1}`}
                        </a>
                      ))}

                  {!selectedJob.contacto && (
                    <span className="flex-1 text-center bg-slate-100 text-slate-400 text-xs font-bold py-3.5 rounded-2xl">
                      No hay contacto registrado
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          TÉRMINOS
          ====================================================== */}

      {showTerms && (
        <div
          className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTerms(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col animate-modal">
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-[#0B132B] text-sm font-bold bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-[#0B132B] mb-4 pr-12">
              📜 Términos, Condiciones y Descargo de Responsabilidad
            </h3>

            <div className="overflow-y-auto space-y-4 text-xs sm:text-[13px] text-slate-600 pr-2 mb-6 leading-relaxed font-medium">
              <p>
                <strong className="text-[#0B132B]">1. Naturaleza del Servicio:</strong>{' '}
                ChambaFija es un directorio y espacio publicitario digital independiente que difunde ofertas laborales del sector privado local y convocatorias públicas del Estado en Cerro de Pasco. Operamos estrictamente como un{' '}
                <em>tablón de anuncios clasificados</em>.
              </p>

              <p>
                <strong className="text-[#0B132B]">2. Exoneración de Responsabilidad:</strong>{' '}
                No participamos ni intervenimos en procesos de selección. Las ofertas privadas son responsabilidad exclusiva de los anunciantes. Las convocatorias estatales se enlazan solo con fines informativos desde fuentes oficiales.
              </p>

              <p>
                <strong className="text-[#0B132B]">3. Protección de Datos:</strong>{' '}
                ChambaFija <strong>NO recopila ni almacena Currículums Vitae (CV)</strong> de los postulantes. Las postulaciones se realizan de forma directa mediante enlaces externos o WhatsApp proporcionados por los empleadores.
              </p>

              <p>
                <strong className="text-[#0B132B]">4. Publicidad:</strong>{' '}
                Los espacios publicitarios mostrados en ChambaFija corresponden a anuncios de terceros. ChambaFija actúa como medio de difusión y no garantiza los productos, servicios, precios o condiciones ofrecidas por los anunciantes.
              </p>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="w-full bg-[#0B132B] hover:bg-slate-800 text-[#06D6A0] text-xs font-extrabold py-3.5 rounded-2xl shadow-md cursor-pointer transition-all"
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="bg-[#0B132B] text-slate-400 text-xs px-4 py-12 text-center border-t border-slate-800/90 mt-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="relative overflow-hidden bg-[#131F42]/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 max-w-xl mx-auto shadow-xl">
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-[#06D6A0]/10 blur-2xl pointer-events-none" />
            <h4 className="text-white text-base sm:text-lg font-extrabold mb-2">
              🔔 Recibe alertas de empleo diarias en tu celular
            </h4>

            <p className="text-slate-300 text-xs sm:text-sm mb-5 leading-relaxed">
              Únete a nuestros canales oficiales y sé el primero en postular a las convocatorias del Estado y negocios locales de Cerro de Pasco.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* WHATSAPP */}
              <a
                href="https://whatsapp.com/channel/0029Vb8NSHbDJ6H4RX6Zqj25"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#06D6A0] hover:bg-emerald-300 text-[#0B132B] font-extrabold py-3 px-6 rounded-2xl transition-all shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.183 0-5.767 2.584-5.767 5.767 0 1.01.265 1.959.728 2.782l-.764 2.788 2.859-.751c.789.434 1.708.683 2.684.683 3.183 0 5.767-2.584 5.767-5.767 0-3.183-2.584-5.767-5.767-5.767zm3.322 8.167c-.139.39-.811.722-1.116.768-.291.045-.658.082-1.066-.051-.247-.079-.564-.183-.969-.356-1.712-.738-2.831-2.482-2.918-2.599-.087-.117-.696-.927-.696-1.769 0-.842.439-1.256.595-1.427.156-.171.341-.214.455-.214.114 0 .228.003.328.012.105.01.246-.039.384.292.139.332.476 1.157.518 1.242.043.085.072.185.014.299-.058.114-.087.185-.173.285-.086.1-.182.224-.26.3-.087.087-.179.182-.077.356.101.174.45.744.966 1.206.666.595 1.228.779 1.402.868.174.089.277.074.38-.043.103-.117.442-.514.56-.69.117-.176.234-.148.39-.09.156.058 1.001.472 1.173.558.172.086.287.129.329.2.043.071.043.413-.096.803z" />
                </svg>
                Canal de WhatsApp
              </a>

              {/* TELEGRAM */}
              <a
                href="https://t.me/Chamba_Fija"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-extrabold py-3 px-6 rounded-2xl transition-all shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.1-1.78 6.84-2.95 8.22-3.51 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.57.18.15.12.19.28.21.4-.01.07.01.35-.06.7z" />
                </svg>
                Canal de Telegram
              </a>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-extrabold text-white text-sm tracking-wide">
              ChambaFija · Región Pasco
            </p>

            <p className="leading-relaxed text-slate-400 max-w-2xl mx-auto font-medium">
              ChambaFija es un espacio de difusión informativo independiente (tablón de anuncios clasificados). No participamos en los procesos de selección ni manejamos bases de datos de postulantes.
            </p>

            <div>
              <button
                onClick={() => setShowTerms(true)}
                className="text-[#06D6A0] hover:underline font-extrabold text-xs bg-transparent border-none cursor-pointer transition-all"
              >
                Ver Términos y Condiciones
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-2">
              © 2026 ChambaFija. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}