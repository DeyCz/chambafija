
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.convocatoriasdetrabajo.com';
const URL_LISTADO = `${BASE_URL}/buscar-trabajos-en-PASCO-19.html`;

const cliente = axios.create({
  timeout: 30000,
  maxRedirects: 5,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
  },
});

// --------------------------------------------------
// UTILIDADES
// --------------------------------------------------


function limpiar(texto = '') {
  return String(texto)
    .replace(/\u00a0/g, ' ')
    .split(/\n+/)
    .map(linea => linea.replace(/[ \t]+/g, ' ').trim())
    .filter(linea => !/^(publicidad|anuncios?)$/i.test(linea))
    .join('\n')
    .trim();
}


function normalizar(texto = '') {
  return limpiar(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function textoDe($elemento) {
  return limpiar($elemento.text());
}

function absolutizar(url, origen = BASE_URL) {
  try {
    return new URL(url, origen).href;
  } catch {
    return '';
  }
}

function primerResultado(texto, patrones) {
  for (const patron of patrones) {
    const resultado = texto.match(patron);

    if (resultado && resultado[1]) {
      return limpiar(resultado[1]);
    }
  }

  return '';
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --------------------------------------------------
// DESCARGAR UNA PÁGINA
// --------------------------------------------------

async function descargarPagina(url) {
  const respuesta = await cliente.get(url);

  if (!respuesta.data) {
    throw new Error(`La página no devolvió contenido: ${url}`);
  }

  return cheerio.load(respuesta.data);
}

// --------------------------------------------------
// OBTENER ENLACES DE CONVOCATORIAS DEL LISTADO
// --------------------------------------------------

async function obtenerEnlacesListado(url = URL_LISTADO) {
  console.log(`Leyendo listado: ${url}`);

  const $ = await descargarPagina(url);
  const encontrados = new Map();

  $('a[href]').each((_, elemento) => {
    const $a = $(elemento);
    const href = $a.attr('href');

    if (!href) return;

    const enlace = absolutizar(href, url);

    if (!enlace.startsWith(BASE_URL)) return;

    const ruta = new URL(enlace).pathname.toLowerCase();

    // Solo páginas individuales de oportunidades laborales.
    if (!ruta.includes('oportunidad-laboral-')) return;

    // Evitar duplicados.
    if (!encontrados.has(enlace)) {
      encontrados.set(enlace, {
        url: enlace,
        tituloListado: textoDe($a),
      });
    }
  });

  const enlaces = [...encontrados.values()];

  console.log(`Convocatorias encontradas: ${enlaces.length}`);

  return enlaces;
}

// --------------------------------------------------
// PREPARAR EL CONTENIDO PRINCIPAL
// --------------------------------------------------

function obtenerContenidoPrincipal($, titulo = '') {
  // Eliminar elementos que suelen contener publicidad,
  // menús, enlaces sociales o contenido que no pertenece
  // a la convocatoria.
  const selectoresEliminar = [
    'script',
    'style',
    'noscript',
    'iframe',
    'svg',
    'nav',
    'header',
    'footer',
    'aside',
    'form',
    '.ads',
    '.ad',
    '.advertisement',
    '.publicidad',
    '.sidebar',
    '.social',
    '.share',
    '.compartir',
    '.menu',
    '.breadcrumb',
    '.breadcrumbs',
    '.related',
    '.relacionados',
    '.comentarios',
    '#comments',
    '#commentform',
  ];

  for (const selector of selectoresEliminar) {
    $(selector).remove();
  }

  // Buscar contenedores habituales.
  const selectores = [
    'article',
    '[itemprop="articleBody"]',
    '.entry-content',
    '.post-content',
    '.contenido-principal',
    '.contenido',
    '.detalle-convocatoria',
    '.job-detail',
    '.job-description',
    '.single-content',
    '.content-detail',
    'main',
    '#content',
    '.content',
  ];

  let mejorElemento = null;
  let mejorPuntaje = -1;

  for (const selector of selectores) {
    $(selector).each((_, elemento) => {
      const $elemento = $(elemento);
      const texto = normalizar($elemento.text());

      if (texto.length < 250) return;

      let puntaje = 0;

      if (texto.includes('requisitos')) puntaje += 3;
      if (texto.includes('condiciones del contrato')) puntaje += 3;
      if (texto.includes('como postular')) puntaje += 3;
      if (texto.includes('descargar bases')) puntaje += 2;
      if (texto.includes('numero de vacantes')) puntaje += 2;
      if (texto.includes('remuneracion')) puntaje += 2;
      if (texto.includes('plazo para postular')) puntaje += 2;

      // Evitar elegir un contenedor enorme si hay otro
      // más específico con el mismo puntaje.
      puntaje -= Math.floor(texto.length / 20000);

      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejorElemento = elemento;
      }
    });
  }

  if (mejorElemento && mejorPuntaje >= 3) {
    console.log('Se encontró el contenido principal de la convocatoria.');
    return $(mejorElemento);
  }

  // IMPORTANTE:
  // Si no se reconoce ningún contenedor, no detener el
  // scraper. Usar el body ya limpiado como alternativa.
  console.warn(
    `No se reconoció un contenedor específico para "${titulo}". ` +
    'Se utilizará el contenido de la página como alternativa.'
  );

  return $('body');
}

// --------------------------------------------------
// EXTRAER UN BLOQUE ENTRE DOS ENCABEZADOS
// --------------------------------------------------

function extraerBloque($contenido, encabezadosInicio, encabezadosFin = []) {
  const lineas = textoDe($contenido)
    .split(/\n+/)
    .map((linea) => limpiar(linea))
    .filter(Boolean);

  const normalizarEncabezado = (texto) => normalizar(texto)
    .replace(/[:：]+$/g, '')
    .trim();

  const inicios = encabezadosInicio.map(normalizarEncabezado);
  const finales = encabezadosFin.map(normalizarEncabezado);

  let indiceInicio = -1;

  for (let i = 0; i < lineas.length; i++) {
    const linea = normalizarEncabezado(lineas[i]);

    if (
      inicios.some((encabezado) =>
        linea === encabezado ||
        linea.startsWith(`${encabezado}:`)
      )
    ) {
      indiceInicio = i + 1;
      break;
    }
  }

  if (indiceInicio < 0) return '';

  const resultado = [];

  for (let i = indiceInicio; i < lineas.length; i++) {
    const linea = normalizarEncabezado(lineas[i]);

    const esFinal = finales.some((encabezado) =>
      linea === encabezado ||
      linea.startsWith(`${encabezado}:`)
    );

    if (esFinal) break;

    resultado.push(lineas[i]);
  }

  return limpiar(resultado.join('\n'));
}

// --------------------------------------------------
// DETECTAR DATOS GENERALES
// --------------------------------------------------

function detectarEntidad(texto, titulo = '') {
  // Primero revisar el título de la convocatoria.
  // Así evitamos confundirlo con anuncios de otras entidades.
  const encabezado = normalizar(titulo);

  const entidades = [
    {
      nombre: 'MINEDU',
      patron: /\bminedu\b|ministerio de educacion/,
    },
    {
      nombre: 'INEI',
      patron: /\binei\b|instituto nacional de estadistica e informatica/,
    },
    {
      nombre: 'Gobierno Regional de Pasco',
      patron: /gobierno regional de pasco|\bgore pasco\b/,
    },
    {
      nombre: 'DIRESA Pasco',
      patron: /\bdiresa\b/,
    },
    {
      nombre: 'DRE Pasco',
      patron: /\bdre pasco\b|direccion regional de educacion de pasco/,
    },
    {
      nombre: 'UGEL',
      patron: /\bugel\b/,
    },
    {
      nombre: 'Municipalidad Provincial de Pasco',
      patron: /municipalidad provincial de pasco/,
    },
    {
      nombre: 'Municipalidad Distrital',
      patron: /municipalidad distrital/,
    },
    {
      nombre: 'EsSalud',
      patron: /essalud/,
    },
    {
      nombre: 'Poder Judicial',
      patron: /poder judicial/,
    },
    {
      nombre: 'ONPE',
      patron: /\bonpe\b/,
    },
    {
      nombre: 'RENIEC',
      patron: /\breniec\b/,
    },
  ];

  for (const entidad of entidades) {
    if (entidad.patron.test(encabezado)) {
      return entidad.nombre;
    }
  }

  // Solo si el título no identifica la entidad,
  // buscar en el texto de la convocatoria.
  const contenido = normalizar(texto);

  for (const entidad of entidades) {
    if (entidad.patron.test(contenido)) {
      return entidad.nombre;
    }
  }

  return '';
}




function detectarPuesto(titulo = '') {
  let puesto = limpiar(titulo)
    .replace(/^convocatoria\s*/i, '')
    .replace(/\s*\|\s*convocatorias de trabajo.*$/i, '')
    .trim();

  // Quitar la entidad al inicio del título.
  puesto = puesto.replace(
    /^ministerio de educaci[oó]n\s*\(\s*minedu\s*\)\s*/i,
    ''
  );

  puesto = puesto.replace(/^minedu\s*[-:|]?\s*/i, '');
  puesto = puesto.replace(/^inei\s*[-:|]?\s*/i, '');

  // Quitar el número de convocatoria si aparece antes del cargo.
  puesto = puesto.replace(
    /^cas\s*n[.°ºo]*\s*\d+\s*:\s*/i,
    ''
  );

  return limpiar(puesto);
}


function detectarVacantes(texto) {
  return primerResultado(texto, [
    /n[uú]mero de vacantes\s*:\s*(\d+)/i,
    /(\d+)\s*(?:plazas?|plaza\(s\)|vacantes?)\s*(?:disponibles?)?/i,
    /vacantes?\s*:\s*(\d+)/i,
  ]);
}

function detectarSueldo(texto) {
  const lineas = texto.split(/\n+/);

  for (const linea of lineas) {
    if (
      /remuneraci[oó]n|sueldo|asignaci[oó]n econ[oó]mica|monto total del contrato/i
        .test(linea)
    ) {
      const monto = linea.match(
        /(?:S\/\.?|S\/|PEN)\s*\d[\d.,]*(?:\s*(?:soles?))?/i
      );

      if (monto) return limpiar(monto[0]);
    }
  }

  // Alternativa: detectar un importe junto a una etiqueta
  // de remuneración en el texto completo.
  return primerResultado(texto, [
    /(?:remuneraci[oó]n|sueldo)\s*[:\-]?\s*((?:S\/\.?|S\/|PEN)\s*[\d.,]+)/i,
    /asignaci[oó]n econ[oó]mica\s*[:\-]?\s*((?:S\/\.?|S\/|PEN)\s*[\d.,]+)/i,
    /monto total del contrato\s*[:\-]?\s*((?:S\/\.?|S\/|PEN)\s*[\d.,]+)/i,
  ]);
}

function detectarUbicacion(texto, titulo = '') {
  const lugar = primerResultado(texto, [
    /lugar de prestaci[oó]n(?: del servicio)?\s*:\s*([^\n]+)/i,
    /departamento\s*:\s*([^\n]+)/i,
    /ubicaci[oó]n\s*:\s*([^\n]+)/i,
    /lugar de labores\s*:\s*([^\n]+)/i,
  ]);

  if (lugar) return lugar;

  const coincidencia = `${titulo}\n${texto}`.match(
    /\b(Pasco|Cerro de Pasco|Yanacancha|Chaupimarca|Oxapampa|Villa Rica)\b/i
  );

  return coincidencia ? limpiar(coincidencia[1]) : '';
}



function detectarModalidad(texto, titulo = '') {
  const encabezado = normalizar(titulo);
  const contenido = normalizar(texto);

  // El título de esta convocatoria ya indica CAS.
  if (/\bcas\b/.test(encabezado)) {
    return 'CAS';
  }

  if (
    /contratacion administrativa de servicios|\bregimen laboral cas\b|\bmodalidad cas\b/.test(contenido)
  ) {
    return 'CAS';
  }

  if (/locacion de servicios/.test(contenido)) {
    return 'Locación de servicios';
  }

  if (/practicas profesionales/.test(contenido)) {
    return 'Prácticas profesionales';
  }

  if (/practicas preprofesionales/.test(contenido)) {
    return 'Prácticas preprofesionales';
  }

  if (/decreto legislativo n.? 728|regimen laboral 728/.test(contenido)) {
    return 'Régimen laboral 728';
  }

  if (/decreto legislativo n.? 276|regimen laboral 276/.test(contenido)) {
    return 'Régimen laboral 276';
  }

  return '';
}




function detectarFechaLimite(texto) {
  const limpio = texto
    .split(/\n+/)
    .map(limpiar)
    .filter(linea => linea && normalizar(linea) !== 'publicidad');

  // Priorizar la fecha final del registro de postulantes.
  for (const linea of limpio) {
    if (
      /registro de ficha de postulantes/i.test(linea) ||
      /registro de postulantes/i.test(linea)
    ) {
      const fechas = linea.match(
        /\b(?:del|desde el)\s+\d{1,2}\s+de\s+[a-záéíóúñ]+\s+(?:al|hasta el)\s+\d{1,2}\s+de\s+[a-záéíóúñ]+\s+del?\s*\d{4}/i
      );

      if (fechas) {
        const final = fechas[0].match(
          /\b(?:al|hasta el)\s+(\d{1,2}\s+de\s+[a-záéíóúñ]+\s+del?\s*\d{4})/i
        );

        if (final) return limpiar(final[1]);
      }
    }
  }

  // Alternativa para páginas que publican una fecha límite explícita.
  for (const linea of limpio) {
    if (/fecha l[ií]mite|plazo para postular|vigente hasta/i.test(linea)) {
      const fecha = linea.match(
        /\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4}/i
      );

      if (fecha) return limpiar(fecha[0]);
    }
  }

  return '';
}


function detectarFechaPublicacion(texto) {
  return primerResultado(texto, [
    /fecha de publicaci[oó]n\s*[:\-]?\s*([^\n]+)/i,
    /publicado el\s*[:\-]?\s*([^\n]+)/i,
    /fecha de convocatoria\s*[:\-]?\s*([^\n]+)/i,
  ]);
}

// --------------------------------------------------
// ENLACES PARA POSTULAR Y DESCARGAR BASES
// --------------------------------------------------

function extraerEnlacesPostulacion($, urlPagina) {
  const enlaces = [];
  const vistos = new Set();

  $('a[href]').each((_, elemento) => {
    const $a = $(elemento);
    const href = $a.attr('href');
    const texto = textoDe($a);

    if (!href) return;

    const url = absolutizar(href, urlPagina);

    if (!url || vistos.has(url)) return;

    if (/^(javascript:|mailto:|tel:)/i.test(href)) return;

    if (
      /facebook\.com|instagram\.com|tiktok\.com|youtube\.com|whatsapp\.com|twitter\.com|x\.com/i
        .test(url)
    ) {
      return;
    }

    const contexto = normalizar(
      `${texto} ${$a.attr('title') || ''} ${href}`
    );

    const esUtil = /postula|bases|cronograma|curriculum|curr[ií]culum|declaraci[oó]n jurada|descargar|ficha de postulantes|convocatoria completa|especificaciones|locales de sede|documentos para postular/i
      .test(contexto);

    if (!esUtil) return;

    vistos.add(url);

    enlaces.push({
      texto: texto || 'Ver enlace',
      url,
    });
  });

  return enlaces;
}

// --------------------------------------------------
// EXTRAER REQUISITOS Y FUNCIONES
// --------------------------------------------------

function extraerRequisitos(texto) {
  const bloque = extraerBloque(
    { text: () => texto },
    [
      'Requisitos para el puesto',
      'Requisitos',
      'Perfil del puesto',
      'Perfil requerido',
      'Formación académica',
    ],
    [
      'Condiciones del contrato',
      'Funciones',
      'Cómo postular',
      'Como postular',
      'Descargar bases',
      'Descargar las bases',
      'Resultados de la convocatoria',
      'Recomendaciones para postular',
    ]
  );

  return bloque || '';
}

function extraerFunciones(texto) {
  return extraerBloque(
    { text: () => texto },
    [
      'Funciones del puesto',
      'Funciones',
      'Principales funciones',
      'Actividades a realizar',
    ],
    [
      'Requisitos',
      'Requisitos para el puesto',
      'Condiciones del contrato',
      'Cómo postular',
      'Como postular',
      'Descargar bases',
      'Resultados de la convocatoria',
    ]
  );
}

function extraerComoPostular(texto) {
  return extraerBloque(
    { text: () => texto },
    [
      'Cómo postular',
      'Como postular',
      'Procedimiento de postulación',
      'Procedimiento de postulacion',
    ],
    [
      'Descargar bases',
      'Descargar las bases',
      'Recomendaciones para postular',
      'Resultados de la convocatoria',
      'Te sugerimos',
    ]
  );
}

// --------------------------------------------------
// EXTRAER DATOS DE UNA CONVOCATORIA
// --------------------------------------------------

function extraerCampos($, url) {
  const $h1 = $('h1').first();

  const titulo = textoDe($h1) ||
    textoDe($('title').first()) ||
    'Convocatoria sin título';

  const $contenido = obtenerContenidoPrincipal($, titulo);
  const texto = textoDe($contenido);

  const requisitos = extraerRequisitos(texto);
  const funciones = extraerFunciones(texto);
  const comoPostular = extraerComoPostular(texto);

  const entidad = detectarEntidad(texto, titulo);
  const puesto = detectarPuesto(titulo);
  const vacantes = detectarVacantes(texto);
  const sueldo = detectarSueldo(texto);
  const ubicacion = detectarUbicacion(texto, titulo);
  const modalidad = detectarModalidad(texto, titulo);
  const fechaLimite = detectarFechaLimite(texto);
  const fechaPublicacion = detectarFechaPublicacion(texto);
  const enlacesPostulacion = extraerEnlacesPostulacion($, url);

  return {
    titulo,
    puesto,
    entidad,
    vacantes,
    sueldo,
    remuneracion: sueldo,
    requisitos,
    funciones,
    ubicacion,
    modalidad,
    fechaPublicacion,
    fechaLimite,
    comoPostular,
    enlacesPostulacion,
    url,
    fuente: url,
    contenidoTexto: texto,
  };
}

// --------------------------------------------------
// PROCESAR UNA CONVOCATORIA
// --------------------------------------------------

async function extraerDetalle(url) {
  console.log(`\nProcesando: ${url}`);

  const $ = await descargarPagina(url);
  const datos = extraerCampos($, url);

  console.log('Resultado de extracción:');
  console.log(
    JSON.stringify(
      {
        titulo: datos.titulo,
        entidad: datos.entidad,
        puesto: datos.puesto,
        vacantes: datos.vacantes,
        sueldo: datos.sueldo,
        ubicacion: datos.ubicacion,
        modalidad: datos.modalidad,
        fechaPublicacion: datos.fechaPublicacion,
        fechaLimite: datos.fechaLimite,
        requisitos: datos.requisitos,
        funciones: datos.funciones,
        comoPostular: datos.comoPostular,
        enlacesPostulacion: datos.enlacesPostulacion,
        url: datos.url,
      },
      null,
      2
    )
  );

  return datos;
}

// --------------------------------------------------
// PROCESAR TODAS LAS CONVOCATORIAS DEL LISTADO
// --------------------------------------------------

async function extraerConvocatoriasEstado(urlListado = URL_LISTADO) {
  const enlaces = await obtenerEnlacesListado(urlListado);
  const resultados = [];

  for (let i = 0; i < enlaces.length; i++) {
    const item = enlaces[i];

    console.log(`\n[${i + 1}/${enlaces.length}] ${item.url}`);

    try {
      const datos = await extraerDetalle(item.url);

      // Conservar el título del listado si el detalle
      // no tiene un título reconocible.
      if (
        (!datos.titulo || datos.titulo === 'Convocatoria sin título') &&
        item.tituloListado
      ) {
        datos.titulo = item.tituloListado;
      }

      resultados.push(datos);
    } catch (error) {
      console.error(
        `No se pudo procesar ${item.url}: ${error.message}`
      );
    }

    // Esperar entre solicitudes para no saturar el sitio.
    if (i < enlaces.length - 1) {
      await esperar(1000);
    }
  }

  console.log(
    `\nProceso terminado. Convocatorias procesadas: ${resultados.length}`
  );

  return resultados;
}

// --------------------------------------------------
// EJECUCIÓN DESDE POWERSHELL
// --------------------------------------------------

if (require.main === module) {
  const urlPrueba = process.argv[2];

  (async () => {
    try {
      if (urlPrueba) {
        await extraerDetalle(urlPrueba);
      } else {
        await extraerConvocatoriasEstado();
      }
    } catch (error) {
      console.error(`Error en el scraper: ${error.message}`);
      process.exitCode = 1;
    }
  })();
}

// --------------------------------------------------
// EXPORTAR FUNCIONES PARA OTROS ARCHIVOS DEL PROYECTO
// --------------------------------------------------

module.exports = {
  obtenerEnlacesListado,
  extraerDetalle,
  extraerConvocatoriasEstado,
};
