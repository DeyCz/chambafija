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
        <span className="whitespace-nowrap">
          ⏳ Del {formatD(inicio)} al
        </span>{' '}
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
    borde: '#93C5FD',
  },

  'Viviendas en alquiler': {
    icono: '🏠',
    color: '#16A34A',
    fondo: '#F0FDF4',
    borde: '#86EFAC',
  },

  Vehículos: {
    icono: '🚗',
    color: '#DC2626',
    fondo: '#FEF2F2',
    borde: '#FCA5A5',
  },

  Servicios: {
    icono: '🛠️',
    color: '#9333EA',
    fondo: '#FAF5FF',
    borde: '#D8B4FE',
  },

  Ventas: {
    icono: '🏷️',
    color: '#EA580C',
    fondo: '#FFF7ED',
    borde: '#FDBA74',
  },

  Otros: {
    icono: '📌',
    color: '#64748B',
    fondo: '#F8FAFC',
    borde: '#CBD5E1',
  },
};

const getCategoriaConfig = (categoria) =>
  categoriasClasificados[categoria] ||
  categoriasClasificados.Otros;

/* ============================================================
   PUBLICIDADES
   ============================================================

   AQUÍ AGREGAS LAS PUBLICIDADES.

   Google Drive:
   1. Sube la imagen a Drive.
   2. Compartir.
   3. "Cualquier persona con el enlace".
   4. Copia el ID del archivo.

   Ejemplo de enlace:
   https://drive.google.com/file/d/1ABCDEF123456789/view

   El ID sería:
   1ABCDEF123456789

   Luego solamente colocas ese ID en driveId.

   whatsapp:
   número PERUANO SIN +51.
   Ejemplo:
   967576214

   ============================================================ */

const publicidades = [
  {
    id: 'publicidad-1',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_1',
    nombre: 'Publicidad 1',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },

  {
    id: 'publicidad-2',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_2',
    nombre: 'Publicidad 2',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },

  {
    id: 'publicidad-3',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_3',
    nombre: 'Publicidad 3',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },

  {
    id: 'publicidad-4',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_4',
    nombre: 'Publicidad 4',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },

  {
    id: 'publicidad-5',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_5',
    nombre: 'Publicidad 5',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
    activo: true,
  },

  {
    id: 'publicidad-6',
    driveId: 'COLOCA_AQUI_EL_ID_DE_DRIVE_6',
    nombre: 'Publicidad 6',
    whatsapp: '967576214',
    mensaje:
      'Hola, vi su publicidad en ChambaFija y quisiera más información.',
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

  const imagenUrl =
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(
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
      className="group relative block w-full overflow-hidden bg-slate-100"
    >
      {/* Imagen tipo banner */}
      <div className="relative w-full h-[120px] sm:h-[160px] md:h-[190px] lg:h-[220px]">
        <img
          src={imagenUrl}
          alt={publicidad.nombre}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        />

        {/* Degradado inferior */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Etiqueta */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
            📢 Publicidad
          </span>
        </div>

        {/* WhatsApp */}
        {numero && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-3 py-2 rounded-full shadow-lg transition-all duration-300 group-hover:bg-emerald-400 group-hover:scale-105">
              📲 Contactar
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
    <section className="w-full mb-7 sm:mb-8">
      

      {/* =====================================================
          PUBLICIDADES REALES
          ===================================================== */}
      {hayPublicidad ? (
        <div className="w-full">
          {anunciosActivos.map((publicidad) => (
            <PublicidadCard
              key={publicidad.id}
              publicidad={publicidad}
            />
          ))}
        </div>
      ) : (
        /* =====================================================
           ESPACIO DISPONIBLE
           ===================================================== */
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#16203D] to-[#0B132B] border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 py-7 sm:py-8 md:py-9">

              {/* Decoración */}
              <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4 sm:gap-5 text-center sm:text-left">
                
                <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 items-center justify-center text-2xl">
                  📢
                </div>

                <div>
                  <p className="text-emerald-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">
                    Publicidad local
                  </p>

                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">
                    Haz que tu negocio llegue a más personas en Pasco
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Anuncia tu negocio, servicio, producto o emprendimiento
                    en ChambaFija.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#0B132B] font-black text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                📲 Quiero anunciar
              </a>
            </div>
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
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
        {icono} {label}
      </span>

      <span className="text-xs font-bold text-slate-700 break-words">
        {String(valor)}
      </span>
    </div>
  );
};

/* ============================================================
   TÍTULO DE SECCIÓN
   ============================================================ */

const SectionTitle = ({
  icon,
  title,
  subtitle,
  color = '#0B132B',
}) => {
  return (
    <div className="mb-5 mt-10">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
          style={{
            backgroundColor: `${color}12`,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div
        className="h-1 w-16 rounded-full mt-3"
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  );
};

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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
        tipoFiltro === 'Todos' ||
        tipoFiltro === 'Destacados'
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
      console.error(
        'Error al conectar con el servidor:',
        error
      );

      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filter);
  }, [filter]);

  /* ==========================================================
     FILTRADO
     ========================================================== */

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      /* ------------------------------------------------------
         ELIMINAR ANUNCIOS VENCIDOS
         ------------------------------------------------------ */

      if (job.fechaVencimiento) {
        const fechaString = String(
          job.fechaVencimiento
        ).split('T')[0];

        const partes = fechaString.split('-');

        if (partes.length === 3) {
          const [year, month, day] = partes;

          let h = 23;
          let m = 59;

          if (job.horaVencimiento) {
            const [hours, minutes] =
              String(job.horaVencimiento).split(':');

            const horaNumero = parseInt(hours, 10);
            const minutoNumero = parseInt(minutes, 10);

            if (!Number.isNaN(horaNumero)) {
              h = horaNumero;
            }

            if (!Number.isNaN(minutoNumero)) {
              m = minutoNumero;
            }
          }

          const fechaExp = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            h,
            m,
            59
          );

          if (
            !Number.isNaN(fechaExp.getTime()) &&
            new Date() > fechaExp
          ) {
            return false;
          }
        }
      }

      /* ------------------------------------------------------
         BÚSQUEDA
         ------------------------------------------------------ */

      const texto = searchTerm
        .toLowerCase()
        .trim();

      if (!texto) {
        if (filter === 'Destacados') {
          return Boolean(job.esVip);
        }

        if (filter === 'Empleos') {
          return job.tipo === 'Privado';
        }

        if (filter === 'Estado') {
          return job.tipo === 'Estado';
        }

        if (filter === 'Anuncios Clasificados') {
          return job.tipo === 'Clasificado';
        }

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
        (campo) =>
          campo &&
          String(campo)
            .toLowerCase()
            .includes(texto)
      );

      if (!matchesSearch) {
        return false;
      }

      /* ------------------------------------------------------
         FILTROS
         ------------------------------------------------------ */

      if (filter === 'Destacados') {
        return Boolean(job.esVip);
      }

      if (filter === 'Empleos') {
        return job.tipo === 'Privado';
      }

      if (filter === 'Estado') {
        return job.tipo === 'Estado';
      }

      if (filter === 'Anuncios Clasificados') {
        return job.tipo === 'Clasificado';
      }

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

        if (!Number.isNaN(timestamp)) {
          return timestamp;
        }
      }

      return 0;
    };

    return [...filteredJobs].sort((a, b) => {
      /* VIP SIEMPRE PRIMERO */
      const vipA = Boolean(a.esVip);
      const vipB = Boolean(b.esVip);

      if (vipA !== vipB) {
        return vipA ? -1 : 1;
      }

      /* TIPO */
      const prioridadA =
        prioridadTipo[a.tipo] || 99;

      const prioridadB =
        prioridadTipo[b.tipo] || 99;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      /* MÁS RECIENTE */
      return (
        getTimestamp(b) -
        getTimestamp(a)
      );
    });
  }, [filteredJobs]);

  /* ==========================================================
     AGRUPACIONES
     ========================================================== */

  const vipJobs = useMemo(
    () =>
      sortedJobs.filter(
        (job) => Boolean(job.esVip)
      ),
    [sortedJobs]
  );

  const privateJobs = useMemo(
    () =>
      sortedJobs.filter(
        (job) =>
          job.tipo === 'Privado' &&
          !job.esVip
      ),
    [sortedJobs]
  );

  const estadoJobs = useMemo(
    () =>
      sortedJobs.filter(
        (job) =>
          job.tipo === 'Estado' &&
          !job.esVip
      ),
    [sortedJobs]
  );

  const clasificadosJobs = useMemo(
    () =>
      sortedJobs.filter(
        (job) =>
          job.tipo === 'Clasificado' &&
          !job.esVip
      ),
    [sortedJobs]
  );

  const categoriasConAnuncios = useMemo(
    () =>
      Object.keys(categoriasClasificados).filter(
        (categoria) =>
          clasificadosJobs.some(
            (job) =>
              (job.categoriaClasificado ||
                'Otros') === categoria
          )
      ),
    [clasificadosJobs]
  );

  /* ==========================================================
     BUSCADOR + DESPLAZAMIENTO
     ========================================================== */

  const desplazarAResultados = () => {
    window.setTimeout(() => {
      const filtros =
        document.getElementById(
          'filtros-anuncios'
        );

      if (!filtros) return;

      const esMobile =
        window.innerWidth < 640;

      if (esMobile) {
        const headerOffset = 90;

        const top =
          filtros.getBoundingClientRect().top +
          window.scrollY -
          headerOffset;

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
    if (!fechaISO) {
      return 'Recientemente';
    }

    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
      return 'Recientemente';
    }

    return fecha.toLocaleDateString(
      'es-PE',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  /* ==========================================================
     DATOS CLASIFICADOS
     ========================================================== */

  const renderDatosClasificado = (
    job,
    modo = 'card'
  ) => {
    const categoria =
      job.categoriaClasificado ||
      'Otros';

    const datos = [];

    if (categoria === 'Locales en alquiler') {
      datos.push(
        <CampoClasificado
          key="tipoLocal"
          label="Tipo de local"
          valor={job.tipoLocal}
          icono="🏪"
        />,
        <CampoClasificado
          key="area"
          label="Área"
          valor={job.area}
          icono="📐"
        />,
        <CampoClasificado
          key="ambientes"
          label="Ambientes"
          valor={job.ambientes}
          icono="🚪"
        />,
        <CampoClasificado
          key="banos"
          label="Baños"
          valor={job.banos}
          icono="🚿"
        />,
        <CampoClasificado
          key="garantia"
          label="Garantía"
          valor={job.garantia}
          icono="🔐"
        />
      );
    } else if (
      categoria === 'Viviendas en alquiler'
    ) {
      datos.push(
        <CampoClasificado
          key="tipoVivienda"
          label="Tipo de vivienda"
          valor={job.tipoVivienda}
          icono="🏠"
        />,
        <CampoClasificado
          key="area"
          label="Área"
          valor={job.area}
          icono="📐"
        />,
        <CampoClasificado
          key="dormitorios"
          label="Dormitorios"
          valor={job.dormitorios}
          icono="🛏️"
        />,
        <CampoClasificado
          key="banos"
          label="Baños"
          valor={job.banos}
          icono="🚿"
        />,
        <CampoClasificado
          key="cochera"
          label="Cochera"
          valor={job.cochera}
          icono="🚗"
        />,
        <CampoClasificado
          key="amoblado"
          label="Amoblado"
          valor={job.amoblado}
          icono="🛋️"
        />,
        <CampoClasificado
          key="serviciosIncluidos"
          label="Servicios incluidos"
          valor={job.serviciosIncluidos}
          icono="💡"
        />,
        <CampoClasificado
          key="garantia"
          label="Garantía"
          valor={job.garantia}
          icono="🔐"
        />
      );
    } else if (categoria === 'Vehículos') {
      datos.push(
        <CampoClasificado
          key="tipoVehiculo"
          label="Tipo"
          valor={job.tipoVehiculo}
          icono="🚗"
        />,
        <CampoClasificado
          key="marca"
          label="Marca"
          valor={job.marca}
          icono="🏷️"
        />,
        <CampoClasificado
          key="modelo"
          label="Modelo"
          valor={job.modelo}
          icono="🚘"
        />,
        <CampoClasificado
          key="anio"
          label="Año"
          valor={job.anio}
          icono="📅"
        />,
        <CampoClasificado
          key="kilometraje"
          label="Kilometraje"
          valor={job.kilometraje}
          icono="🛣️"
        />,
        <CampoClasificado
          key="combustible"
          label="Combustible"
          valor={job.combustible}
          icono="⛽"
        />,
        <CampoClasificado
          key="transmision"
          label="Transmisión"
          valor={job.transmision}
          icono="⚙️"
        />,
        <CampoClasificado
          key="colorVehiculo"
          label="Color"
          valor={job.colorVehiculo}
          icono="🎨"
        />
      );
    } else if (categoria === 'Servicios') {
      datos.push(
        <CampoClasificado
          key="tipoServicio"
          label="Servicio"
          valor={job.tipoServicio}
          icono="🛠️"
        />,
        <CampoClasificado
          key="modalidadServicio"
          label="Modalidad"
          valor={job.modalidadServicio}
          icono="💻"
        />,
        <CampoClasificado
          key="zonaAtencion"
          label="Zona de atención"
          valor={job.zonaAtencion}
          icono="📍"
        />
      );
    } else if (categoria === 'Ventas') {
      datos.push(
        <CampoClasificado
          key="producto"
          label="Producto"
          valor={job.producto}
          icono="📦"
        />,
        <CampoClasificado
          key="marcaProducto"
          label="Marca"
          valor={job.marcaProducto}
          icono="🏷️"
        />,
        <CampoClasificado
          key="estadoProducto"
          label="Estado"
          valor={job.estadoProducto}
          icono="✨"
        />,
        <CampoClasificado
          key="cantidad"
          label="Cantidad"
          valor={job.cantidad}
          icono="🔢"
        />
      );
    } else {
      datos.push(
        <CampoClasificado
          key="area"
          label="Área / Medida"
          valor={job.area}
          icono="📐"
        />
      );
    }

    const items = datos.filter(Boolean);

    if (!items.length) {
      return null;
    }

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
    /* --------------------------------------------------------
       CLASIFICADOS
       -------------------------------------------------------- */

    if (job.tipo === 'Clasificado') {
      const categoria =
        job.categoriaClasificado ||
        'Otros';

      const config =
        getCategoriaConfig(categoria);

      return (
        <div
          className="bg-white rounded-2xl p-5 border-2 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all hover:-translate-y-1"
          style={{
            borderColor: job.esVip
              ? '#818CF8'
              : config.borde,

            backgroundColor: job.esVip
              ? '#EEF2FF'
              : config.fondo,
          }}
        >
          {job.esVip && (
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              ⭐ VIP
            </div>
          )}

          <div>
            <div className="mb-3">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide"
                style={{
                  backgroundColor: config.fondo,
                  color: config.color,
                  border: `1px solid ${config.borde}`,
                }}
              >
                {config.icono} {categoria}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4 leading-tight">
              {job.titulo}
            </h3>

            <div
              className="bg-white/80 p-4 rounded-xl border mb-4"
              style={{
                borderColor: config.borde,
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <CampoClasificado
                  label="Ubicación"
                  valor={
                    job.ubicacion ||
                    'Pasco'
                  }
                  icono="📍"
                />

                <CampoClasificado
                  label="Precio"
                  valor={
                    job.sueldo ||
                    'A tratar'
                  }
                  icono="💰"
                />
              </div>

              <div
                className="mt-3 pt-3 border-t"
                style={{
                  borderColor: config.borde,
                }}
              >
                {renderDatosClasificado(
                  job
                )}
              </div>
            </div>

            {job.descripcion && (
              <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-3">
                {job.descripcion}
              </p>
            )}

            <p className="text-[10px] text-slate-400 font-bold mb-4">
              📅 Publicado:{' '}
              {formatearFechaPub(
                job.fechaInicio ||
                  job.fechaPublicacion
              )}
            </p>
          </div>

          <button
            onClick={() =>
              setSelectedJob(job)
            }
            className="w-full text-white text-xs font-black py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
            style={{
              backgroundColor: config.color,
            }}
          >
            📲 Ver detalles y contactar
          </button>
        </div>
      );
    }

    /* --------------------------------------------------------
       EMPLEO / ESTADO
       -------------------------------------------------------- */

    return (
      <div
        className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 ${
          job.esVip
            ? 'border-amber-400 bg-amber-50/20'
            : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.empresa || 'Empresa'}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold flex-shrink-0">
                  {job.tipo === 'Estado'
                    ? '🏛️'
                    : '🏪'}
                </div>
              )}

              <div className="min-w-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    job.tipo === 'Estado'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-[#FF6B00]'
                  }`}
                >
                  {job.tipo === 'Estado'
                    ? '🏛️ Público'
                    : '🏪 Empleo Local'}
                </span>

                <p className="text-xs text-slate-500 font-bold mt-0.5 whitespace-normal break-words leading-tight">
                  {job.empresa || 'Empresa'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {job.esVip && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  ⭐ VIP
                </span>
              )}

              {job.tipo === 'Estado' &&
                job.fechaVencimiento && (
                  <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-md flex flex-col items-end leading-tight text-right">
                    {formatDateRange(
                      job.fechaInicio,
                      job.fechaVencimiento,
                      job.horaVencimiento
                    )}
                  </div>
                )}
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 leading-snug">
            {job.titulo}
          </h3>

          <p className="text-xs text-slate-600 font-semibold mb-3 flex items-center gap-1">
            <span>📍</span>

            <span className="truncate">
              {job.ubicacion ||
                'Pasco'}
            </span>
          </p>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-3">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-500 font-bold">
                Remuneración:
              </span>

              <span className="font-black text-emerald-600 text-right">
                {job.sueldo ||
                  'A tratar'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-500 font-bold">
                Modalidad:
              </span>

              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[150px]">
                {job.modalidad ||
                  'No especificada'}
              </span>
            </div>

            {job.vacantes && (
              <div className="flex justify-between items-center text-xs gap-2">
                <span className="text-slate-500 font-bold">
                  Vacantes / Plazas:
                </span>

                <span className="font-bold text-blue-600">
                  {job.vacantes}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            setSelectedJob(job)
          }
          className="w-full bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
        >
          {job.tipo === 'Estado'
            ? 'VER CONVOCATORIA'
            : 'Ver Detalles y Postular'}
        </button>
      </div>
    );
  };

  /* ==========================================================
     GRID
     ========================================================== */

  const CardsGrid = ({ items }) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((job) => (
          <JobCard
            key={job._id}
            job={job}
          />
        ))}
      </div>
    );
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="bg-[#0B132B] text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* LOGO */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <a
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Chamba Fija Pasco"
                className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </a>

            <span className="text-[10px] bg-slate-800/90 text-orange-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ml-2 border border-orange-500/30 animate-pulse font-semibold whitespace-nowrap">
              Pasco 🏔️
            </span>
          </div>

          {/* BUSCADOR */}
          <div className="w-full sm:w-[420px] relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              🔍
            </span>

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Buscar empleo, local, vehículo..."
              className="w-full pl-11 pr-12 py-3 text-sm rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] transition-all shadow-inner"
            />

            {/* BOTÓN BUSCAR */}
            <button
              type="button"
              onClick={ejecutarBusqueda}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#06D6A0] text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all"
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
              className="w-full sm:w-auto text-center bg-gradient-to-r from-[#06D6A0] to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-slate-950 hover:text-white text-xs font-black px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
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
        className="relative bg-cover bg-[center_bottom_55%] overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white py-14 px-4 text-center shadow-xl"
        style={{
          backgroundImage:
            "url('/portadav2.png')",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,214,160,0.1)_0,transparent_50%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <span className="bg-slate-800/90 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-500/30 inline-flex items-center gap-1.5 shadow-sm backdrop-blur-md animate-pulse">
            ⚡ Empleos, convocatorias y clasificados al instante.
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Encuentra de todo en{' '}
            <span className="text-[#06D6A0]">
              PASCO
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Conectando negocios locales, procesos del Estado,
            y anuncios clasificados de forma directa y sin intermediarios.
          </p>
        </div>
      </section>

      {/* ====================================================
            PUBLICIDAD
            ==================================================== */}

        {!loading && (
          <PublicidadSection
            whatsappUrl={whatsappPublicidadUrl}
          />
        )}
        

      {/* ======================================================
          FILTROS
          ====================================================== */}

      <nav
        id="filtros-anuncios"
        className="max-w-6xl mx-auto px-4 py-8 w-full flex flex-wrap gap-3 items-center justify-center sm:justify-start scroll-mt-24"
      >
        {[
          'Todos',
          'Empleos',
          'Estado',
          'Anuncios Clasificados',
          'Destacados',
        ].map((filtro) => (
          <button
            key={filtro}
            onClick={() => {
              setFilter(filtro);

              window.setTimeout(() => {
                const filtros =
                  document.getElementById(
                    'filtros-anuncios'
                  );

                if (filtros) {
                  filtros.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              }, 50);
            }}
            className={`text-xs px-6 py-3 rounded-2xl font-black transition-all duration-300 shadow-xs ${
              filter === filtro
                ? 'bg-[#0B132B] text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            {filtro === 'Todos'
              ? '🔍 Todos'
              : filtro === 'Empleos'
              ? '💼 Empleos'
              : filtro === 'Estado'
              ? '🏛️ Estado'
              : filtro ===
                'Anuncios Clasificados'
              ? '📢 Clasificados'
              : '⭐ Destacados'}
          </button>
        ))}
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
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-slate-200 h-64 animate-pulse flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-4">
                  <div className="w-24 h-6 bg-slate-200 rounded-xl" />
                  <div className="w-full h-7 bg-slate-200 rounded-xl" />
                  <div className="w-3/4 h-4 bg-slate-200 rounded-lg" />
                </div>

                <div className="w-full h-11 bg-slate-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="py-24 text-center text-slate-500 space-y-4">
            <div className="text-5xl">
              🔎
            </div>

            <p className="text-lg font-bold text-slate-700">
              No se encontraron ofertas activas 📉
            </p>

            <p className="text-xs text-slate-400">
              Intenta cambiar los filtros o realizar otra búsqueda.
            </p>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('Todos');

                window.setTimeout(() => {
                  desplazarAResultados();
                }, 100);
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black shadow-md"
            >
              Restablecer filtros
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
                      subtitle="🚀 ¡Que todos vean tu negocio! Destácalo en ChambaFija"
                      color="#6366F1"
                    />

                    <CardsGrid
                      items={vipJobs}
                    />

                    {/* CTA VIP */}
                    <div className="mt-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-black text-slate-900">
                          ⭐ ¿Quieres que tu negocio destaque?
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Haz que más personas encuentren tu negocio en ChambaFija.
                        </p>
                      </div>

                      <a
                        href={whatsappVIPUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
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
                      title="Empleos"
                      subtitle="Oportunidades laborales en Pasco"
                      color="#EA580C"
                    />

                    <CardsGrid
                      items={privateJobs}
                    />
                  </section>
                )}

                {/* ESTADO */}
                {estadoJobs.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="🏛️"
                      title="Convocatorias del Estado"
                      subtitle="Procesos y oportunidades del sector público"
                      color="#2563EB"
                    />

                    <CardsGrid
                      items={estadoJobs}
                    />
                  </section>
                )}

                {/* CLASIFICADOS */}
                {categoriasConAnuncios.length > 0 && (
                  <section>
                    <SectionTitle
                      icon="📢"
                      title="Anuncios Clasificados"
                      subtitle="Compra, vende, alquila o encuentra servicios en Pasco"
                      color="#9333EA"
                    />

                    {categoriasConAnuncios.map(
                      (categoria) => {
                        const config =
                          getCategoriaConfig(
                            categoria
                          );

                        const anunciosCategoria =
                          clasificadosJobs.filter(
                            (job) =>
                              (job.categoriaClasificado ||
                                'Otros') ===
                              categoria
                          );

                        return (
                          <div
                            key={categoria}
                            className="mb-10"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                style={{
                                  backgroundColor:
                                    config.fondo,
                                  border:
                                    `1px solid ${config.borde}`,
                                }}
                              >
                                {config.icono}
                              </div>

                              <div>
                                <h3
                                  className="text-base sm:text-lg font-black"
                                  style={{
                                    color:
                                      config.color,
                                  }}
                                >
                                  {categoria}
                                </h3>

                                <p className="text-[10px] text-slate-400 font-medium">
                                  {
                                    anunciosCategoria.length
                                  }{' '}
                                  {anunciosCategoria.length ===
                                  1
                                    ? 'anuncio'
                                    : 'anuncios'}
                                </p>
                              </div>
                            </div>

                            <CardsGrid
                              items={
                                anunciosCategoria
                              }
                            />
                          </div>
                        );
                      }
                    )}
                  </section>
                )}
              </>
            )}

            {/* =================================================
                DESTACADOS
                ================================================= */}

            {filter === 'Destacados' && (
              <>
                {vipJobs.length > 0 && (
                  <>
                    <SectionTitle
                      icon="⭐"
                      title="Anuncios Destacados"
                      subtitle="🚀 Dale mayor visibilidad a tu negocio en ChambaFija"
                      color="#6366F1"
                    />

                    <CardsGrid
                      items={vipJobs}
                    />

                    <div className="mt-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-black text-slate-900">
                          ⭐ Haz que tu negocio aparezca entre los destacados
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Aumenta la visibilidad de tu anuncio y llega a más personas.
                        </p>
                      </div>

                      <a
                        href={whatsappVIPUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-3 rounded-xl shadow-md transition-all"
                      >
                        📲 Quiero ser VIP
                      </a>
                    </div>
                  </>
                )}
              </>
            )}

            {/* =================================================
                EMPLEOS
                ================================================= */}

            {filter === 'Empleos' && (
              <>
                {sortedJobs.length > 0 && (
                  <>
                    <SectionTitle
                      icon="💼"
                      title="Empleos"
                      subtitle="Oportunidades laborales disponibles"
                      color="#EA580C"
                    />

                    <CardsGrid
                      items={sortedJobs}
                    />
                  </>
                )}
              </>
            )}

            {/* =================================================
                ESTADO
                ================================================= */}

            {filter === 'Estado' && (
              <>
                {sortedJobs.length > 0 && (
                  <>
                    <SectionTitle
                      icon="🏛️"
                      title="Convocatorias del Estado"
                      subtitle="Procesos de selección del sector público"
                      color="#2563EB"
                    />

                    <CardsGrid
                      items={sortedJobs}
                    />
                  </>
                )}
              </>
            )}

            {/* =================================================
                CLASIFICADOS
                ================================================= */}

            {filter ===
              'Anuncios Clasificados' && (
              <>
                <SectionTitle
                  icon="📢"
                  title="Anuncios Clasificados"
                  subtitle="Anuncios publicados en Pasco"
                  color="#9333EA"
                />

                {categoriasConAnuncios.map(
                  (categoria) => {
                    const config =
                      getCategoriaConfig(
                        categoria
                      );

                    const anunciosCategoria =
                      sortedJobs.filter(
                        (job) =>
                          (job.categoriaClasificado ||
                            'Otros') ===
                          categoria
                      );

                    if (
                      anunciosCategoria.length ===
                      0
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={categoria}
                        className="mb-10"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                            style={{
                              backgroundColor:
                                config.fondo,
                              border:
                                `1px solid ${config.borde}`,
                            }}
                          >
                            {config.icono}
                          </div>

                          <div>
                            <h3
                              className="text-base sm:text-lg font-black"
                              style={{
                                color:
                                  config.color,
                              }}
                            >
                              {categoria}
                            </h3>

                            <p className="text-[10px] text-slate-400 font-medium">
                              {
                                anunciosCategoria.length
                              }{' '}
                              {anunciosCategoria.length ===
                              1
                                ? 'anuncio'
                                : 'anuncios'}
                            </p>
                          </div>
                        </div>

                        <CardsGrid
                          items={
                            anunciosCategoria
                          }
                        />
                      </div>
                    );
                  }
                )}
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
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedJob(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
            {/* CERRAR */}
            <button
              onClick={() =>
                setSelectedJob(null)
              }
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* TIPO */}
            {(() => {
              const config =
                selectedJob.tipo ===
                'Clasificado'
                  ? getCategoriaConfig(
                      selectedJob.categoriaClasificado ||
                        'Otros'
                    )
                  : null;

              return (
                <span
                  className="inline-block text-[10px] font-black px-3.5 py-1.5 rounded-xl mb-3 self-start pr-12"
                  style={
                    selectedJob.tipo ===
                    'Clasificado'
                      ? {
                          backgroundColor:
                            config.fondo,
                          color:
                            config.color,
                          border:
                            `1px solid ${config.borde}`,
                        }
                      : {
                          backgroundColor:
                            selectedJob.tipo ===
                            'Estado'
                              ? '#F1F5F9'
                              : '#ECFDF5',
                          color:
                            selectedJob.tipo ===
                            'Estado'
                              ? '#1E293B'
                              : '#047857',
                          border:
                            `1px solid ${
                              selectedJob.tipo ===
                              'Estado'
                                ? '#CBD5E1'
                                : '#A7F3D0'
                            }`,
                        }
                  }
                >
                  {selectedJob.esVip &&
                    '⭐ VIP · '}

                  {selectedJob.tipo === 'Estado'
                    ? 'Convocatoria Oficial del Estado'
                    : selectedJob.tipo ===
                      'Clasificado'
                    ? `${config.icono} ${
                        selectedJob.categoriaClasificado ||
                        'Otros'
                      }`
                    : 'Empleo Privado Local'}
                </span>
              );
            })()}

            {/* TÍTULO */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight pr-8">
              {selectedJob.tipo ===
              'Clasificado'
                ? selectedJob.titulo
                : `${selectedJob.empresa || 'Empresa'}: ${
                    selectedJob.titulo
                  }`}
            </h3>

            {/* UBICACIÓN */}
            <p className="text-xs text-slate-500 font-semibold mb-6 flex items-center gap-1">
              📍{' '}
              {selectedJob.ubicacion ||
                'Pasco'}
            </p>

            {/* CONTENIDO */}
            <div className="overflow-y-auto pr-2 space-y-4 mb-6 text-xs text-slate-700">
              {/* ESTADO */}
              {selectedJob.tipo === 'Estado' ? (
                <>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Requisitos del Puesto
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      <p>
                        <strong>
                          Número de vacantes:
                        </strong>{' '}
                        {selectedJob.vacantes ||
                          '1'}
                      </p>

                      {selectedJob.formacion && (
                        <p className="whitespace-pre-wrap">
                          <strong>
                            Formación Académica:
                          </strong>
                          <br />
                          {selectedJob.formacion}
                        </p>
                      )}

                      {selectedJob.experiencia && (
                        <p className="whitespace-pre-wrap">
                          <strong>
                            Experiencia:
                          </strong>
                          <br />
                          {selectedJob.experiencia}
                        </p>
                      )}

                      {selectedJob.especializacion && (
                        <p className="whitespace-pre-wrap">
                          <strong>
                            Cursos y/o programas:
                          </strong>
                          <br />
                          {selectedJob.especializacion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Condiciones del Contrato
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      <p>
                        <strong>
                          Lugar de prestación:
                        </strong>{' '}
                        {selectedJob.empresa ||
                          selectedJob.ubicacion ||
                          'Pasco'}
                      </p>

                      <p>
                        <strong>
                          Remuneración:
                        </strong>{' '}

                        <span className="text-emerald-600 font-black">
                          {selectedJob.sueldo
                            ? String(
                                selectedJob.sueldo
                              ).startsWith('S/')
                              ? selectedJob.sueldo
                              : `S/ ${selectedJob.sueldo}`
                            : 'A tratar'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      ¿Cómo postular?
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      <p>
                        <strong>
                          Plazo límite:
                        </strong>{' '}

                        <span className="font-bold text-red-600">
                          {selectedJob.fechaVencimiento
                            ? formatDateRange(
                                selectedJob.fechaInicio,
                                selectedJob.fechaVencimiento,
                                selectedJob.horaVencimiento
                              )
                            : 'Ver cronograma'}
                        </span>
                      </p>

                      <p>
                        <strong>
                          Procedimiento:
                        </strong>{' '}

                        {selectedJob.comoPostular ||
                          'Presentación de expediente según bases oficiales.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Enlaces Oficiales y Bases del Concurso
                    </div>

                    <div className="p-4 space-y-2.5 font-medium">
                      {selectedJob.enlaceBases && (
                        <p>
                          👉{' '}
                          <a
                            href={
                              selectedJob.enlaceBases
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline font-bold"
                          >
                            Ver Bases y Convocatoria Completa (PDF)
                          </a>
                        </p>
                      )}

                      {selectedJob.enlacesExtras &&
                        Array.isArray(
                          selectedJob.enlacesExtras
                        ) &&
                        selectedJob.enlacesExtras.map(
                          (link, idx) =>
                            link?.url && (
                              <p key={idx}>
                                👉{' '}
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:underline font-bold"
                                >
                                  {link.titulo ||
                                    'Ver enlace oficial'}
                                </a>
                              </p>
                            )
                        )}

                      {!selectedJob.enlaceBases &&
                        (!selectedJob.enlacesExtras ||
                          selectedJob
                            .enlacesExtras
                            .length ===
                            0) && (
                          <p className="text-slate-400 italic">
                            No hay enlaces externos registrados para este proceso.
                          </p>
                        )}
                    </div>
                  </div>
                </>
              ) : selectedJob.tipo ===
                'Clasificado' ? (
                (() => {
                  const categoria =
                    selectedJob.categoriaClasificado ||
                    'Otros';

                  const config =
                    getCategoriaConfig(
                      categoria
                    );

                  return (
                    <div
                      className="p-5 rounded-2xl border space-y-5"
                      style={{
                        backgroundColor:
                          config.fondo,
                        borderColor:
                          config.borde,
                      }}
                    >
                      <div
                        className="rounded-xl p-4 bg-white/80 border"
                        style={{
                          borderColor:
                            config.borde,
                        }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span
                              className="block text-[10px] uppercase font-bold mb-1"
                              style={{
                                color:
                                  config.color,
                              }}
                            >
                              💰 Precio
                            </span>

                            <span
                              className="font-extrabold text-lg"
                              style={{
                                color:
                                  config.color,
                              }}
                            >
                              {selectedJob.sueldo ||
                                'A tratar'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                              📍 Ubicación
                            </span>

                            <span className="font-bold text-slate-800 text-sm">
                              {selectedJob.ubicacion ||
                                'Pasco'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                              📅 Publicado el
                            </span>

                            <span className="font-bold text-slate-800 text-sm">
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
                          className="font-black mb-3"
                          style={{
                            color:
                              config.color,
                          }}
                        >
                          {config.icono}{' '}
                          Características del anuncio
                        </h4>

                        <div
                          className="bg-white/80 rounded-xl border p-4"
                          style={{
                            borderColor:
                              config.borde,
                          }}
                        >
                          {renderDatosClasificado(
                            selectedJob,
                            'modal'
                          ) || (
                            <p className="text-slate-400 italic">
                              No hay características adicionales registradas.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4
                          className="font-bold mb-2"
                          style={{
                            color:
                              config.color,
                          }}
                        >
                          Descripción Detallada:
                        </h4>

                        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                          {selectedJob.descripcion ||
                            'Sin descripción adicional.'}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* EMPLEO PRIVADO */
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between border-b border-slate-200 pb-2 gap-4">
                    <span className="text-slate-500 font-bold">
                      Remuneración:
                    </span>

                    <span className="font-extrabold text-emerald-600 text-right">
                      {selectedJob.sueldo ||
                        'A tratar'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 pb-2 gap-4">
                    <span className="text-slate-500 font-bold">
                      Modalidad:
                    </span>

                    <span className="font-bold text-slate-800 text-right">
                      {selectedJob.modalidad ||
                        'No especificada'}
                    </span>
                  </div>

                  {selectedJob.experiencia && (
                    <div className="border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 mb-1">
                        Experiencia Requerida:
                      </h4>

                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedJob.experiencia}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">
                      Descripción del Puesto:
                    </h4>

                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedJob.descripcion ||
                        'Sin descripción adicional.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() =>
                  setSelectedJob(null)
                }
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-2xl transition-all"
              >
                Cerrar
              </button>

              {selectedJob.tipo ===
              'Estado' ? (
                selectedJob.enlaceBases ? (
                  <a
                    href={
                      selectedJob.enlaceBases
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    📄 Descargar Bases Oficiales
                  </a>
                ) : null
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                  {selectedJob.contacto &&
                    String(
                      selectedJob.contacto
                    )
                      .split(',')
                      .map((c) =>
                        c.trim()
                      )
                      .filter(Boolean)
                      .map(
                        (
                          num,
                          i,
                          arr
                        ) => (
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
                            className="w-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center text-center gap-1"
                          >
                            📲{' '}
                            {arr.length ===
                            1
                              ? 'Contactar por WhatsApp'
                              : `Contactar WhatsApp #${
                                  i + 1
                                }`}
                          </a>
                        )
                      )}

                  {!selectedJob.contacto && (
                    <span className="flex-1 text-center bg-slate-100 text-slate-400 text-xs font-bold py-3.5 rounded-xl">
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() =>
                setShowTerms(false)
              }
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-4 pr-12">
              📜 Términos, Condiciones y Descargo de Responsabilidad
            </h3>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 pr-2 mb-6 leading-relaxed font-medium">
              <p>
                <strong>
                  1. Naturaleza del Servicio:
                </strong>{' '}
                ChambaFija es un directorio y espacio publicitario digital independiente que difunde ofertas laborales del sector privado local y convocatorias públicas del Estado en Cerro de Pasco. Operamos estrictamente como un{' '}
                <em>
                  tablón de anuncios clasificados
                </em>
                .
              </p>

              <p>
                <strong>
                  2. Exoneración de Responsabilidad:
                </strong>{' '}
                No participamos ni intervenimos en procesos de selección. Las ofertas privadas son responsabilidad exclusiva de los anunciantes. Las convocatorias estatales se enlazan solo con fines informativos desde fuentes oficiales.
              </p>

              <p>
                <strong>
                  3. Protección de Datos:
                </strong>{' '}
                ChambaFija{' '}
                <strong>
                  NO recopila ni almacena Currículums Vitae (CV)
                </strong>{' '}
                de los postulantes. Las postulaciones se realizan de forma directa mediante enlaces externos o WhatsApp proporcionados por los empleadores.
              </p>

              <p>
                <strong>
                  4. Publicidad:
                </strong>{' '}
                Los espacios publicitarios mostrados en ChambaFija corresponden a anuncios de terceros. ChambaFija actúa como medio de difusión y no garantiza los productos, servicios, precios o condiciones ofrecidas por los anunciantes.
              </p>
            </div>

            <button
              onClick={() =>
                setShowTerms(false)
              }
              className="w-full bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-black py-3.5 rounded-2xl shadow-md"
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="bg-[#0F172A] text-slate-400 text-xs px-4 py-8 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 max-w-lg mx-auto">
            <h4 className="text-white text-base font-extrabold mb-2">
              🔔 Recibe alertas de empleo diarias en tu celular
            </h4>

            <p className="text-slate-400 text-xs mb-4">
              Únete a nuestros canales oficiales y sé el primero en postular a las convocatorias del Estado y negocios locales de Cerro de Pasco.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* WHATSAPP */}
              <a
                href="https://whatsapp.com/channel/0029Vb8NSHbDJ6H4RX6Zqj25"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.031 6.172c-3.183 0-5.767 2.584-5.767 5.767 0 1.01.265 1.959.728 2.782l-.764 2.788 2.859-.751c.789.434 1.708.683 2.684.683 3.183 0 5.767-2.584 5.767-5.767 0-3.183-2.584-5.767-5.767-5.767zm3.322 8.167c-.139.39-.811.722-1.116.768-.291.045-.658.082-1.066-.051-.247-.079-.564-.183-.969-.356-1.712-.738-2.831-2.482-2.918-2.599-.087-.117-.696-.927-.696-1.769 0-.842.439-1.256.595-1.427.156-.171.341-.214.455-.214.114 0 .228.003.328.012.105.01.246-.039.384.292.139.332.476 1.157.518 1.242.043.085.072.185.014.299-.058.114-.087.185-.173.285-.086.1-.182.224-.26.3-.087.087-.179.182-.077.356.101.174.45.744.966 1.206.666.595 1.228.779 1.402.868.174.089.277.074.38-.043.103-.117.442-.514.56-.69.117-.176.234-.148.39-.09.156.058 1.001.472 1.173.558.172.086.287.129.329.2.043.071.043.413-.096.803z" />
                </svg>

                Canal de WhatsApp
              </a>

              {/* TELEGRAM */}
              <a
                href="https://t.me/Chamba_Fija"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 px-5 rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.1-1.78 6.84-2.95 8.22-3.51 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.57.18.15.12.19.28.21.4-.01.07.01.35-.06.7z" />
                </svg>

                Canal de Telegram
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-black text-white text-sm">
              ChambaFija - Pasco
            </p>

            <p className="leading-relaxed text-slate-400 max-w-2xl mx-auto font-medium opacity-90">
              ChambaFija es un espacio de difusión informativo independiente (tablón de anuncios clasificados). No participamos en los procesos de selección ni manejamos bases de datos de postulantes.
            </p>

            <div>
              <button
                onClick={() =>
                  setShowTerms(true)
                }
                className="text-[#06D6A0] hover:underline font-extrabold text-xs bg-transparent border-none cursor-pointer transition-all"
              >
                Ver Términos y Condiciones
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 opacity-75">
              © 2026 ChambaFija. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}