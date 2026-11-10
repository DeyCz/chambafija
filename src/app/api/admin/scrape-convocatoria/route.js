import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const HOSTS_PERMITIDOS = new Set([
  "convocatoriasdetrabajo.com",
  "www.convocatoriasdetrabajo.com",
]);

const MESES = {
  enero: "01", febrero: "02", marzo: "03", abril: "04",
  mayo: "05", junio: "06", julio: "07", agosto: "08",
  septiembre: "09", setiembre: "09", octubre: "10",
  noviembre: "11", diciembre: "12",
  ene: "01", feb: "02", mar: "03", abr: "04",
  may: "05", jun: "06", jul: "07", ago: "08",
  sep: "09", set: "09", oct: "10", nov: "11", dic: "12",
};

// Diccionario de distritos de la región Pasco (prioriza los distritos estándar de tu selector)
const DISTRITOS_PASCO = [
  { etiqueta: "Chaupimarca, Pasco", claves: ["chaupimarca"] },
  { etiqueta: "Yanacancha, Pasco", claves: ["yanacancha"] },
  { etiqueta: "Simón Bolívar, Pasco", claves: ["simon bolivar", "rancas", "paragsha"] },
  { etiqueta: "Pallanchacra, Pasco", claves: ["pallanchacra"] },
  { etiqueta: "Yarusyacán, Pasco", claves: ["yarusyacan", "san francisco de asis de yarusyacan"] },
  { etiqueta: "Oxapampa, Pasco", claves: ["oxapampa"] },
  { etiqueta: "Villa Rica, Pasco", claves: ["villa rica"] },
  { etiqueta: "Vicco, Pasco", claves: ["distrital de vicco", "municipio de vicco", "vicco"] },
  { etiqueta: "Huachón, Pasco", claves: ["huachon"] },
  { etiqueta: "Puerto Bermúdez, Pasco", claves: ["puerto bermudez"] },
  { etiqueta: "Palcazú, Pasco", claves: ["palcazu", "iscozacin"] },
  { etiqueta: "Huayllay, Pasco", claves: ["huayllay"] },
  { etiqueta: "Tinyahuarco, Pasco", claves: ["tinyahuarco", "colquijirca", "smelter"] },
  { etiqueta: "Ninacaca, Pasco", claves: ["ninacaca"] },
  { etiqueta: "Paucartambo, Pasco", claves: ["paucartambo"] },
  { etiqueta: "Huariaca, Pasco", claves: ["huariaca"] },
  { etiqueta: "Ticlacayán, Pasco", claves: ["ticlacayan"] },
  { etiqueta: "Pozuzo, Pasco", claves: ["pozuzo"] },
  { etiqueta: "Chontabamba, Pasco", claves: ["chontabamba"] },
  { etiqueta: "Huancabamba, Pasco", claves: ["huancabamba"] },
  { etiqueta: "Constitución, Pasco", claves: ["constitucion"] },
  { etiqueta: "Yanahuanca, Pasco", claves: ["yanahuanca", "daniel alcides carrion"] },
];

function limpiar(valor = "") {
  return String(valor)
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function normalizar(valor = "") {
  return limpiar(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Elimina del DOM los vínculos de llamada a la acción ("POSTULA AQUÍ", "CLICK AQUÍ", etc.)
function eliminarVinculosPostulacion($) {
  $("a").each((_, el) => {
    const textoNorm = normalizar($(el).text()).replace(/^[•*\-–—👉▶\s]+|[•*\-–—\s]+$/g, "");
    if (
      /^(?:(?:haz|hacer|dale|dar)\s+)?(?:clic|click|postula|postular|postule|ingresa|ingresar|ingrese|inscribete|inscribirse|registrate|registrarse|entra|entrar|ir|ver|accede|acceder)(?:\s+al\s+(?:link|enlace|formulario|sistema))?(?:\s+aqui)?$/i.test(textoNorm) ||
      /^(?:aqui|link|enlace|postula|postular|formulario\s+de\s+postulacion)$/i.test(textoNorm)
    ) {
      $(el).remove();
    }
  });
}

// Lee el DOM conservando la separación de párrafos, encabezados y viñetas.
function obtenerLineas($) {
  const bloque = $("body").get(0);

  const etiquetasBloque = new Set([
    "address", "article", "blockquote", "dd", "div", "dl", "dt",
    "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
    "li", "main", "ol", "p", "section", "table", "tbody", "td",
    "tfoot", "th", "thead", "tr", "ul",
  ]);

  function recorrer(nodo) {
    if (!nodo) return "";

    if (nodo.type === "text") return nodo.data || "";

    if (nodo.type !== "tag" && nodo.type !== "root") return "";

    const tag = (nodo.name || "").toLowerCase();

    if ([
      "script", "style", "noscript", "nav",
      "footer", "iframe", "form", "aside",
    ].includes(tag)) {
      return "";
    }

    if (tag === "br" || tag === "hr") return "\n";

    const esBloque = etiquetasBloque.has(tag);
    let salida = esBloque ? "\n" : "";

    if (tag === "li") salida += "• ";

    for (const hijo of nodo.children || []) {
      salida += recorrer(hijo);
    }

    if (esBloque) salida += "\n";

    return salida;
  }

  return recorrer(bloque)
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map(limpiar)
    .filter(Boolean)
    .filter(linea => !/^publicidad$/i.test(normalizar(linea)));
}

function esCorte(linea, etiquetas = []) {
  const actual = normalizar(linea)
    .replace(/^[•*\-–—\s]+/, "");

  return etiquetas.some(etiqueta => {
    const objetivo = normalizar(etiqueta)
      .replace(/[:?¿]/g, "")
      .trim();

    return (
      actual === objetivo ||
      actual.startsWith(`${objetivo}:`) ||
      actual.startsWith(`${objetivo} `)
    );
  });
}

function limpiarTextoComoPostular(texto = "") {
  let linea = limpiar(texto);
  if (!linea) return "";

  linea = linea.replace(
    /(?:en\s+el\s+|a\s+trav[eé]s\s+del\s+|mediante\s+el\s+)?(?:siguiente\s+)?(?:link|enlace).*?[:\-]?\s*(?:(?:haz|hacer|dale)\s+)?(?:clic|click|postula|postular|postule|ingresa|ingresar|ingrese|inscr[íi]bete|inscribirse|reg[íi]strate|registrarse|entra|ir)\s+aqu[íi]/gi,
    ""
  );

  linea = linea.replace(
    /[\(\[\{]\s*(?:(?:haz|hacer|dale)\s+)?(?:clic|click|postula|postular|postule|ingresa|ingresar|ingrese|inscr[íi]bete|inscribirse|reg[íi]strate|registrarse|entra|ir|ver)?\s*aqu[íi]\s*[\)\]\}]/gi,
    ""
  );

  linea = linea.replace(
    /(?:(?:haz|hacer|dale)\s+)?(?:clic|click|postula|postular|postule|ingresa|ingresar|ingrese|inscr[íi]bete|inscribirse|reg[íi]strate|registrarse|entra|ir)\s+aqu[íi]/gi,
    ""
  );

  linea = linea.replace(
    /(?:en\s+el\s+|a\s+trav[eé]s\s+del\s+|mediante\s+el\s+)?(?:siguiente\s+)?(?:link|enlace)(?:\s+de\s+[\w\sáéíóúñ]+)?\s*[:\-]?\s*$/gi,
    ""
  );

  linea = linea
    .replace(/\(\s*\)|\[\s*\]/g, "")
    .replace(/[:\-–—]\s*$/g, "")
    .trim();

  return linea;
}

function extraerSeccion(lineas, etiqueta, detenerEn = [], icono = "✅") {
  const objetivo = normalizar(etiqueta).replace(/[:?¿]/g, "").trim();
  let inicio = -1;
  let primeraParte = "";
  let ultimaLineaEncabezado = -1;

  for (let i = 0; i < lineas.length && inicio < 0; i++) {
    for (let cantidad = 1; cantidad <= 3 && i + cantidad <= lineas.length; cantidad++) {
      const combinado = lineas.slice(i, i + cantidad).join(" ");
      const combinadoNorm = normalizar(combinado).replace(/^[•*\-–—\s]+/, "");

      if (!combinadoNorm.startsWith(`${objetivo}:`)) continue;

      const dosPuntos = combinado.indexOf(":");
      primeraParte = dosPuntos >= 0 ? limpiar(combinado.slice(dosPuntos + 1)) : "";
      if (objetivo.includes("como postular")) {
        primeraParte = limpiarTextoComoPostular(primeraParte);
      }
      inicio = i;
      ultimaLineaEncabezado = i + cantidad - 1;
      break;
    }
  }

  if (inicio < 0) return "";

  const partesAgrupadas = [];
  let parrafoActual = primeraParte ? `${icono} ${primeraParte}` : "";

  for (let i = ultimaLineaEncabezado + 1; i < lineas.length; i++) {
    let linea = limpiar(lineas[i]);
    if (!linea) continue;

    if (esCorte(linea, detenerEn)) break;

    const normal = normalizar(linea).replace(/^[•*\-–—\s]+/, "");

    if (/^(publicidad|recomendaciones para postular|descarga aqui las bases|resultados de la convocatoria|te sugerimos|convocatorias destacadas)$/.test(normal)) {
      break;
    }

    if (objetivo.includes("como postular")) {
      linea = limpiarTextoComoPostular(linea);
      if (!linea || /^[•*\-–—.\s]*$/.test(linea)) continue;
    }

    const esNuevaVineta = /^[•*\-–—]/.test(linea);
    const lineaLimpia = linea.replace(/^[•*\-–—.]\s*/, "");
    if (!lineaLimpia) continue;

    if (esNuevaVineta || parrafoActual === "") {
      if (parrafoActual) {
        partesAgrupadas.push(parrafoActual);
      }
      parrafoActual = `${icono} ${lineaLimpia}`;
    } else {
      parrafoActual += ` ${lineaLimpia}`;
    }
  }

  if (parrafoActual) {
    partesAgrupadas.push(parrafoActual);
  }

  return limpiar(partesAgrupadas.join("\n"));
}

function extraerEntidad($, lineas = []) {
  const fuentes = [
    limpiar($("h1").first().text()),
    limpiar($("title").text()),
  ].filter(Boolean);

  for (const origen of fuentes) {
    const antesDeFlecha = origen.match(/^(.+?)\s*[>»]\s*convocatoria/i);
    if (antesDeFlecha) {
      const entidad = limpiar(antesDeFlecha[1]).replace(/[-–—_.,|>;:]+$/, "").trim();
      if (entidad.length >= 2) return entidad;
    }

    const match = origen.match(
      /convocatoria\s+(?:de\s+(?:trabajo|pr[áa]cticas|empleo)\s+)?(?:en\s+la\s+|en\s+el\s+|en\s+|de\s+la\s+|del\s+|de\s+)?(.+?)(?:[:\-|>»]|\d{4}|$)/i
    );
    if (match) {
      let entidad = limpiar(match[1]);
      entidad = entidad.split(/\s+(?:para|n[°º]|cas)\s+/i)[0];
      entidad = entidad.replace(/\b(728|276|CAS|CAP|PAC|FAG)\b/gi, "").trim();
      entidad = entidad.replace(/[-–—_.,|>;:]+$/, "").trim();
      if (entidad.length >= 2) return limpiar(entidad);
    }
  }

  for (const linea of lineas) {
    const m = linea.match(/convocatorias\s+(?:vigentes\s+)?de\s+([A-ZÁÉÍÓÚÑ0-9\s()-]{3,80}?)(?:[.]|$)/i);
    if (m) {
      const entidad = limpiar(m[1]).replace(/[-–—_.,|>;:]+$/, "").trim();
      if (entidad.length >= 2) return entidad;
    }
  }

  return "";
}

// NUEVO: Detecta automáticamente el distrito exacto de Pasco
function extraerUbicacion(entidad = "", titulo = "", lineas = []) {
  const buscarDistritoEnTexto = (texto) => {
    const norm = ` ${normalizar(texto).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ")} `;
    for (const item of DISTRITOS_PASCO) {
      for (const clave of item.claves) {
        if (norm.includes(` ${clave} `)) {
          return item.etiqueta;
        }
      }
    }
    return "";
  };

  // 1. Prioridad máxima: línea de "Lugar de prestación del servicio" o "Lugar de trabajo"
  const lineaLugar = lineas.find((l) =>
    /(?:lugar\s+de\s+prestaci[oó]n|lugar\s+de\s+trabajo|ubicaci[oó]n\s*:|sede\s*:)/i.test(l)
  );
  if (lineaLugar) {
    const detectadoEnLugar = buscarDistritoEnTexto(lineaLugar);
    if (detectadoEnLugar) return detectadoEnLugar;
  }

  // 2. Segunda prioridad: nombre de la entidad o título del puesto (ej. "MUNICIPALIDAD DE VICCO")
  const detectadoEnCabecera = buscarDistritoEnTexto(`${entidad} ${titulo}`);
  if (detectadoEnCabecera) return detectadoEnCabecera;

  // 3. Tercera prioridad: cuerpo de la convocatoria
  const detectadoEnCuerpo = buscarDistritoEnTexto(lineas.slice(0, 80).join(" "));
  if (detectadoEnCuerpo) return detectadoEnCuerpo;

  return "Pasco";
}

function extraerTituloPuesto($, lineas) {
  const encabezados = $("h1,h2,h3,h4,h5,p,strong,b,span")
    .map((_, el) => limpiar($(el).text()))
    .get();

  const candidatos = [...encabezados, ...lineas];

  for (const lineaOriginal of candidatos) {
    const linea = limpiar(lineaOriginal);

    const match = linea.match(
      /\b(CAS|728|276|CAP|PAC|FAG)\s*N\s*[°º.xX]?\s*(\d{1,4})\s*(?:[-–—_:]\s*C[ÓO]DIGO\s*[\w/-]+)?\s*[-–—_:.]*\s*(.+)$/i
    );

    if (!match) continue;

    let tipoModalidad = limpiar(match[1]).toUpperCase();
    if (tipoModalidad.includes('728')) tipoModalidad = '728';
    if (tipoModalidad.includes('276')) tipoModalidad = '276';

    let puesto = limpiar(match[3]);

    puesto = puesto.split(
      /\s+(?:Compartir en|Claves del|Requisitos|Formación|1 plaza|\d+\s+plaza|lugar de|gobierno regional|municipalidad|diresa|ugel)/i
    )[0];

    puesto = puesto.replace(/[-–—_.,|>;:]+$/, "").trim();

    if (!puesto || puesto.length < 4) continue;

    const numero = String(Number(match[2])).padStart(3, "0");

    return `${tipoModalidad} N° ${numero} - ${puesto}`.toLocaleUpperCase("es-PE");
  }

  for (const linea of candidatos) {
    const match = linea.match(/(?:PUESTO|CARGO|PERFIL)(?:\s+A\s+CONTRATAR)?\s*[:.-]\s*(.+)/i);
    if (match && match[1].length > 4) {
      let puesto = limpiar(match[1]);
      puesto = puesto.split(/\s+(?:Requisitos|Plazas|Remuneración)/i)[0].replace(/[-–—_.,|>;:]+$/, "").trim();
      return puesto.toLocaleUpperCase("es-PE");
    }
  }

  return "";
}

function normalizarImporte(valor) {
  let numero = String(valor || "").replace(/[^\d.,]/g, "");

  if (!numero) return "";

  const coma = numero.lastIndexOf(",");
  const punto = numero.lastIndexOf(".");

  if (coma >= 0 && punto >= 0) {
    if (coma > punto) {
      numero = numero.replace(/\./g, "").replace(",", ".");
    } else {
      numero = numero.replace(/,/g, "");
    }
  } else if (coma >= 0) {
    const decimales = numero.length - coma - 1;

    numero = decimales === 2
      ? numero.replace(/\./g, "").replace(",", ".")
      : numero.replace(/,/g, "");
  } else if (punto >= 0) {
    const decimales = numero.length - punto - 1;

    if (decimales === 3) {
      numero = numero.replace(/\./g, "");
    }
  }

  const cantidad = Number(numero);

  if (!Number.isFinite(cantidad)) return "";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
}

function extraerRemuneracion(lineas) {
  const detalle = lineas.find(linea =>
    /remuneraci[oó]n\s*:\s*S\s*\/?\s*\.?\s*[\d.,]+/i.test(linea)
  );

  const resumen = lineas.find(linea =>
    /S\s*\/?\s*\.?\s*[\d.,]+\s+remuneraci[oó]n/i.test(linea)
  );

  const fuente = detalle || resumen;

  if (!fuente) return "";

  const match = fuente.match(
    /S\s*\/?\s*\.?\s*([\d.,]+)/i
  );

  const importe = match
    ? normalizarImporte(match[1])
    : "";

  return importe ? `S/ ${importe}` : "";
}

function fechaISO(dia, mesTexto, anio) {
  const mes = MESES[
    normalizar(mesTexto).replace(/\.$/, "")
  ];

  if (!mes) return "";

  const d = Number(dia);
  const y = Number(anio);

  if (d < 1 || d > 31 || y < 2000) return "";

  return `${y}-${mes}-${String(d).padStart(2, "0")}`;
}

function extraerFechas(lineas) {
  const texto = lineas.join(" ").replace(/\s+/g, " ");

  const rangoDosMeses = texto.match(
    /plazo\s+para\s+postular\s*:?\s*(?:el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+y\s+(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );

  if (rangoDosMeses) {
    return {
      fechaInicio: fechaISO(
        rangoDosMeses[1],
        rangoDosMeses[2],
        rangoDosMeses[5]
      ),
      fechaVencimiento: fechaISO(
        rangoDosMeses[3],
        rangoDosMeses[4],
        rangoDosMeses[5]
      ),
    };
  }

  const rangoMismoMes = texto.match(
    /plazo\s+para\s+postular\s*:?\s*(?:del\s+|el\s+)?(\d{1,2})\s*(?:al|a|y|hasta el|[-–])\s*(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );

  if (rangoMismoMes) {
    return {
      fechaInicio: fechaISO(
        rangoMismoMes[1],
        rangoMismoMes[3],
        rangoMismoMes[4]
      ),
      fechaVencimiento: fechaISO(
        rangoMismoMes[2],
        rangoMismoMes[3],
        rangoMismoMes[4]
      ),
    };
  }

  const corta = texto.match(
    /(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)\.?\s+(\d{4})\s+plazo\s+para\s+postular/i
  );

  if (corta) {
    return {
      fechaInicio: "",
      fechaVencimiento: fechaISO(
        corta[1],
        corta[2],
        corta[3]
      ),
    };
  }

  return {
    fechaInicio: "",
    fechaVencimiento: "",
  };
}

function extraerHora(textoComoPostular) {
  const texto = String(textoComoPostular || "").toLowerCase();

  const encontradosConSufijo = [...texto.matchAll(/(\d{1,2})[:.](\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm|hrs|horas)/gi)];
  const encontradosSinSufijo = [...texto.matchAll(/(?:hasta(?:\s+las)?|al|[-–—])\s*(\d{1,2})[:.](\d{2})/gi)];

  const todosEncontrados = [...encontradosConSufijo, ...encontradosSinSufijo];

  if (!todosEncontrados.length) return "";

  const ultimo = todosEncontrados[todosEncontrados.length - 1];

  let hora = Number(ultimo[1]);
  const minuto = Number(ultimo[2]);

  if (ultimo[3]) {
    const sufijo = ultimo[3].replace(/[.\s]/g, "");
    if (sufijo === "pm" && hora < 12) hora += 12;
    if (sufijo === "am" && hora === 12) hora = 0;
  } else {
    if (hora > 0 && hora <= 8) {
      hora += 12;
    }
  }

  if (hora > 23 || minuto > 59) return "";

  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

function extraerEnlaces($) {
  let enlaceBases = "";
  const enlacesExtras = [];
  const urlsVistas = new Set();
  let enSeccionBases = false;

  $('h1, h2, h3, h4, h5, h6, p, strong, b, div, a').each((_, el) => {
    const tag = el.name.toLowerCase();

    if (tag !== 'a') {
      const texto = normalizar($(el).text());

      if (texto.length < 100) {
        if (texto.includes("descarga aqui las bases") || texto.includes("descargar bases")) {
          enSeccionBases = true;
        }
        else if (enSeccionBases && (
          texto.includes("resultados de la") ||
          texto.includes("te sugerimos") ||
          texto.includes("recomendaciones para") ||
          texto.includes("convocatorias destacadas")
        )) {
          enSeccionBases = false;
        }
      }
    }
    else if (tag === 'a' && enSeccionBases) {
      const href = $(el).attr("href");

      if (!href || href.startsWith("javascript:") || href.startsWith("#") || href.includes("facebook.com") || href.includes("whatsapp")) {
        return;
      }

      if (urlsVistas.has(href)) return;

      const tituloOriginal = limpiar($(el).text());

      const tituloLimpio = tituloOriginal
        .replace(/^(?:Descarga aqu[íi][:|-]?\s+|Descargar[:|-]?\s+|Ver aqu[íi][:|-]?\s+|Ver[:|-]?\s+|Revisar[:|-]?\s+)/i, "")
        .trim();

      const tituloNorm = normalizar(tituloOriginal);

      if (!enlaceBases && (tituloNorm.includes("bases") || tituloNorm.includes("convocatoria"))) {
        enlaceBases = href;
        urlsVistas.add(href);
      }
      else if (tituloLimpio !== "") {
        enlacesExtras.push({ titulo: tituloLimpio, url: href });
        urlsVistas.add(href);
      }
    }
  });

  return { enlaceBases, enlacesExtras };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const urlTexto = String(body?.url || "").trim();

    if (!urlTexto) {
      return NextResponse.json(
        {
          success: false,
          mensaje: "Pega el enlace de la convocatoria.",
        },
        { status: 400 }
      );
    }

    let url;

    try {
      url = new URL(urlTexto);
    } catch {
      return NextResponse.json(
        {
          success: false,
          mensaje: "El enlace ingresado no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      url.protocol !== "https:" ||
      !HOSTS_PERMITIDOS.has(url.hostname.toLowerCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          mensaje: "Solo se permiten enlaces HTTPS de convocatoriasdetrabajo.com.",
        },
        { status: 400 }
      );
    }

    const respuesta = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
        "Accept-Language": "es-PE,es;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    if (!respuesta.ok) {
      return NextResponse.json(
        {
          success: false,
          mensaje: `La página de origen respondió ${respuesta.status}.`,
        },
        { status: 502 }
      );
    }

    const html = await respuesta.text();

    if (html.length > 5000000) {
      return NextResponse.json(
        {
          success: false,
          mensaje: "La página es demasiado grande para analizarla.",
        },
        { status: 413 }
      );
    }

    const $ = cheerio.load(html);

    $("script, style, noscript, nav, footer, iframe, form, aside").remove();

    const { enlaceBases, enlacesExtras } = extraerEnlaces($);

    eliminarVinculosPostulacion($);

    const lineas = obtenerLineas($);

    const entidad = extraerEntidad($, lineas);
    const titulo = extraerTituloPuesto($, lineas);
    const ubicacionDetectada = extraerUbicacion(entidad, titulo, lineas);

    const modalidadTexto = [
      limpiar($("title").text()),
      limpiar($("h1").first().text()),
      ...lineas.slice(0, 100),
    ].join(" ");

    const modalidadMatch = modalidadTexto.match(
      /\b(CAS|728|276|D\.?\s*L\.?\s*728|D\.?\s*L\.?\s*276|Pr[áa]cticas|Locaci[oó]n de servicios|Servicio Civil|CAP|PAC|Terceros|FAG|Suplencia)\b/i
    );

    const vacantesLinea = lineas.find(linea =>
      /n[uú]mero de vacantes/i.test(linea)
    );

    const vacantes =
      vacantesLinea?.match(/\b(\d{1,4})\b/)?.[1] ||
      lineas.find(linea => /plaza\(s\)\s*vacante/i.test(linea))
        ?.match(/\b(\d{1,4})\b/)?.[1] ||
      "";

    const formacion = extraerSeccion(
      lineas,
      "Formación Académica",
      [
        "Experiencia",
        "Cursos y/o programas de especialización",
        "Condiciones del contrato",
        "Cómo postular",
      ],
      "🎓"
    );

    const experiencia = extraerSeccion(
      lineas,
      "Experiencia",
      [
        "Cursos y/o programas de especialización",
        "Nota",
        "Condiciones del contrato",
        "Cómo postular",
        "Recomendaciones para postular",
      ],
      "💼"
    );

    const especializacion = extraerSeccion(
      lineas,
      "Cursos y/o programas de especialización",
      [
        "Nota",
        "Condiciones del contrato",
        "Cómo postular",
        "Recomendaciones para postular",
        "Descarga aquí las Bases",
        "Resultados de la convocatoria",
      ],
      "📚"
    );

    const comoPostular = extraerSeccion(
      lineas,
      "Cómo Postular",
      [
        "Recomendaciones para postular",
        "Descarga aquí las Bases",
        "Resultados de la convocatoria",
        "Te sugerimos",
        "Convocatorias destacadas",
      ],
      "📌"
    );

    const fechas = extraerFechas(lineas);
    const remuneracion = extraerRemuneracion(lineas);
    const horaVencimiento = extraerHora(comoPostular);

    const data = {
      empresa: entidad || "",
      titulo: titulo || "",
      modalidad: modalidadMatch
        ? modalidadMatch[1].replace(/\s+/g, " ").trim()
        : "",
      ubicacion: ubicacionDetectada, // Distrito exacto detectado o "Pasco"
      vacantes,
      sueldo: remuneracion,
      fechaInicio: fechas.fechaInicio,
      fechaVencimiento: fechas.fechaVencimiento,
      horaVencimiento,

      formacion,
      experiencia,
      especializacion,
      comoPostular,

      enlaceBases: enlaceBases,
      enlacesExtras: enlacesExtras.length > 0 ? enlacesExtras : [{ titulo: "", url: "" }],
      descripcion: "",
    };

    const camposClave = [
      "empresa",
      "titulo",
      "modalidad",
      "vacantes",
      "sueldo",
      "fechaVencimiento",
      "formacion",
      "experiencia",
      "especializacion",
      "comoPostular",
    ];

    const faltantes = camposClave.filter(
      campo => !data[campo]
    );

    return NextResponse.json({
      success: true,
      data,
      advertencia: faltantes.length
        ? `Revisa los campos no detectados: ${faltantes.join(", ")}.`
        : "Extracción completada. Revisa los datos antes de guardar.",
      camposDetectados: camposClave.length - faltantes.length,
      totalCamposClave: camposClave.length,
    });

  } catch (error) {
    console.error(
      "Error en /api/admin/scrape-convocatoria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        mensaje: error?.name === "TimeoutError"
          ? "La página demoró demasiado en responder. Inténtalo nuevamente."
          : "No se pudo analizar la convocatoria. Comprueba el enlace e inténtalo nuevamente.",
      },
      { status: 500 }
    );
  }
}