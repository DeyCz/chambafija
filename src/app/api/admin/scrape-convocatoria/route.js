
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

// Extrae exclusivamente el contenido posterior a un encabezado.
// Ahora soporta inyección de emojis (icono) en lugar de viñetas.
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
      inicio = i;
      ultimaLineaEncabezado = i + cantidad - 1;
      break;
    }
  }

  if (inicio < 0) return "";

  const partes = [];

  if (primeraParte) partes.push(`${icono} ${primeraParte}`);

  for (let i = ultimaLineaEncabezado + 1; i < lineas.length; i++) {
    const linea = limpiar(lineas[i]);
    if (!linea) continue;
    if (esCorte(linea, detenerEn)) break;

    const normal = normalizar(linea).replace(/^[•*\-–—\s]+/, "");
    if (/^(publicidad|recomendaciones para postular|descarga aqui las bases|resultados de la convocatoria|te sugerimos|convocatorias destacadas)$/.test(normal)) {
      break;
    }

    // Reemplaza viñetas originales (puntos, guiones) e inserta el emoji asignado
    const lineaLimpia = linea.replace(/^[•*\-–—.]\s*/, "");
    partes.push(`${icono} ${lineaLimpia}`);
  }

  return limpiar(partes.join("\n"));
}

// Entidad: toma solo el nombre limpio, ignorando "Convocatoria" y cortando en separadores
function extraerEntidad($) {
  const h1 = limpiar($("h1").first().text());
  const titulo = limpiar($("title").text());
  const origen = h1 || titulo;

  // Busca "Convocatoria", omite palabras de conexión y captura hasta encontrar un separador (: - | ») o número
  const match = origen.match(/convocatoria\s+(?:de\s+(?:trabajo|pr[áa]cticas|empleo)\s+)?(?:en\s+la\s+|en\s+el\s+|en\s+)?(.+?)(?:[:\-|>»]|\d{4}|$)/i);

  if (match) {
    let entidad = limpiar(match[1]);
    // Limpiar si se colaron palabras innecesarias al final
    entidad = entidad.split(/\s+(?:para|n[°º]|cas)\s+/i)[0];
    return limpiar(entidad);
  }

  return "";
}

// Puesto: busca el encabezado CAS independiente, no el H1 principal.
function extraerTituloPuesto($, lineas) {
  const encabezados = $("h1,h2,h3,h4,h5")
    .map((_, el) => limpiar($(el).text()))
    .get();

  const candidatos = [...encabezados, ...lineas];

  for (const lineaOriginal of candidatos) {
    const linea = limpiar(lineaOriginal);

    const match = linea.match(
      /\bCAS\s*N\s*[°º.]?\s*(\d{1,4})\s*(?:[-–—]\s*C[ÓO]DIGO\s*[\w/-]+)?\s*[:：-]\s*(.+)$/i
    );

    if (!match) continue;

    let puesto = limpiar(match[2]);

    puesto = puesto.split(
      /\s+(?:Compartir en|Claves del puesto|Requisitos para el puesto|1 plaza|\d+ plaza\(s\))/i
    )[0];

    puesto = puesto.replace(/[|>].*$/, "").trim();

    if (!puesto) continue;

    const numero = String(Number(match[1])).padStart(3, "0");

    // AQUÍ ESTÁ EL CAMBIO: Se agrega el símbolo "°" explícitamente
    return `CAS N° ${numero} ${puesto}`.toLocaleUpperCase("es-PE");
  }

  return "";
}

// Normaliza importes con punto o coma decimal.
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

// Reconoce rangos entre meses distintos, como 30 de octubre y 02 de noviembre.
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

// Obtiene la última hora del horario de atención como hora límite.
function extraerHora(textoComoPostular) {
  const encontrados = [
    ...String(textoComoPostular || "").matchAll(
      /(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)/gi
    ),
  ];

  if (!encontrados.length) return "";

  const ultimo = encontrados[encontrados.length - 1];

  let hora = Number(ultimo[1]);
  const minuto = Number(ultimo[2]);

  const sufijo = ultimo[3]
    .toLowerCase()
    .replace(/[.\s]/g, "");

  if (sufijo === "pm" && hora < 12) hora += 12;
  if (sufijo === "am" && hora === 12) hora = 0;

  if (hora > 23 || minuto > 59) return "";

  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}


// Extrae los enlaces estrictamente del espacio "Descarga aquí las Bases"
// y recorta los prefijos para dejar los títulos completamente limpios.
function extraerEnlaces($) {
  let enlaceBases = "";
  const enlacesExtras = [];
  const urlsVistas = new Set();
  let enSeccionBases = false;

  // Recorremos la estructura leyendo de arriba a abajo
  $('h1, h2, h3, h4, h5, h6, p, strong, b, div, a').each((_, el) => {
    const tag = el.name.toLowerCase();
    
    // Si no es enlace, verificamos si es un título que abre o cierra la sección
    if (tag !== 'a') {
      const texto = normalizar($(el).text());
      
      // La restricción de longitud (< 100) evita que lea bloques gigantes de texto a la vez
      if (texto.length < 100) {
        if (texto.includes("descarga aqui las bases") || texto.includes("descargar bases")) {
          enSeccionBases = true; // ¡Se enciende la recolección!
        } 
        else if (enSeccionBases && (
          texto.includes("resultados de la") || 
          texto.includes("te sugerimos") || 
          texto.includes("recomendaciones para") || 
          texto.includes("convocatorias destacadas")
        )) {
          enSeccionBases = false; // ¡Se apaga la recolección!
        }
      }
    } 
    // Si ES un enlace y estamos DENTRO de la sección permitida
    else if (tag === 'a' && enSeccionBases) {
      const href = $(el).attr("href");
      
      // Ignorar links vacíos, de redes sociales o anclas
      if (!href || href.startsWith("javascript:") || href.startsWith("#") || href.includes("facebook.com") || href.includes("whatsapp")) {
        return;
      }

      // Evitar guardar el mismo PDF dos veces
      if (urlsVistas.has(href)) return;

      const tituloOriginal = limpiar($(el).text());
      
      // 🚀 MAGIA: Limpiamos los prefijos exactos que pediste (insensible a mayúsculas)
      const tituloLimpio = tituloOriginal
        .replace(/^(?:Descarga aqu[íi][:|-]?\s+|Descargar[:|-]?\s+|Ver aqu[íi][:|-]?\s+|Ver[:|-]?\s+|Revisar[:|-]?\s+)/i, "")
        .trim();
      
      const tituloNorm = normalizar(tituloOriginal);

      // El primer enlace de Bases va directo a la variable principal (no necesita título)
      if (!enlaceBases && (tituloNorm.includes("bases") || tituloNorm.includes("convocatoria"))) {
        enlaceBases = href;
        urlsVistas.add(href);
      } 
      // El resto de enlaces (Instructivos, Declaraciones, Videos) van a los extra
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

    const lineas = obtenerLineas($);

    const entidad = extraerEntidad($);
    const titulo = extraerTituloPuesto($, lineas);

    const modalidadTexto = [
      limpiar($("title").text()),
      limpiar($("h1").first().text()),
      ...lineas.slice(0, 100),
    ].join(" ");

    const modalidadMatch = modalidadTexto.match(
      /\b(CAS|D\.?\s*L\.?\s*728|D\.?\s*L\.?\s*276|Pr[áa]cticas|Locaci[oó]n de servicios|Servicio Civil)\b/i
    );

    const vacantesLinea = lineas.find(linea =>
      /n[uú]mero de vacantes/i.test(linea)
    );

    const vacantes =
      vacantesLinea?.match(/\b(\d{1,4})\b/)?.[1] ||
      lineas.find(linea => /plaza\(s\)\s*vacante/i.test(linea))
        ?.match(/\b(\d{1,4})\b/)?.[1] ||
      "";

    // FORMACIÓN: termina cuando comienza Experiencia.
    const formacion = extraerSeccion(
      lineas,
      "Formación Académica",
      [
        "Experiencia",
        "Cursos y/o programas de especialización",
        "Condiciones del contrato",
        "Cómo postular",
      ],
      "🎓" // Emoji para Formación Académica
    );

    // EXPERIENCIA: termina antes del encabezado de Cursos.
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
      "💼" // Emoji para Experiencia Requerida
    );

    // CURSOS: inicia exactamente después del título indicado.
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
      "📚" // Emoji para Cursos / Especialización
    );

    // POSTULACIÓN: busca el rótulo específico con dos puntos.
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
      "📌" // Emoji para ¿Cómo postular?
    );


    const fechas = extraerFechas(lineas);
    const remuneracion = extraerRemuneracion(lineas);
    const horaVencimiento = extraerHora(comoPostular);

    // Llamamos a la nueva función quirúrgica
    const { enlaceBases, enlacesExtras } = extraerEnlaces($);


    const data = {
      empresa: entidad || "",
      titulo: titulo || "",
      modalidad: modalidadMatch
        ? modalidadMatch[1].replace(/\s+/g, " ").trim()
        : "",
      ubicacion: "",
      vacantes,
      sueldo: remuneracion,
      fechaInicio: fechas.fechaInicio,
      fechaVencimiento: fechas.fechaVencimiento,
      horaVencimiento,

      formacion,
      experiencia,
      especializacion,
      comoPostular,

      // NUEVO: Ahora inyectamos los links encontrados automáticamente
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
