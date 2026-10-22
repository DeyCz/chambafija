
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const HOSTS = new Set([
  "convocatoriasdetrabajo.com",
  "www.convocatoriasdetrabajo.com",
]);

function clean(value = "") {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function normalize(value = "") {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Extrae únicamente el nombre de la entidad después de "Convocatoria".
function extractEntity(title = "") {
  let name = clean(title).replace(
    /^.*?\bconvocatoria\b\s*/i,
    ""
  );

  // Quita prefijos genéricos que no son parte de la entidad.
  name = name.replace(
    /^(?:laboral|de trabajo|de personal)\s+/i,
    ""
  );

  // El puesto y los datos de la convocatoria suelen empezar
  // después de CAS, número, código o un guion separador.
  const stop = name.search(
    /\bCAS\b|\bD\.?\s*L\.?\s*(?:728|276)\b|\bC[ÓO]DIGO\b|\bN[°º.]?\s*\d|\bNRO\.?\b|\bN[ÚU]MERO\b|\s[-–—:]\s/i
  );

  if (stop >= 0) name = name.slice(0, stop);

  name = name
    .replace(/[|,;:–—-]+$/g, "")
    .trim();

  // Capitalización legible, preservando siglas conocidas.
  const acronyms = new Set([
    "UGEL", "DIRESA", "DRE", "GORE", "SUNAT", "ONPE",
    "INEI", "ESSALUD", "RENIEC", "MINSA", "MIDIS",
    "OSCE", "SUNAFIL", "SENASA", "SUTRAN", "INPE",
  ]);

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      const key = word.replace(/[^a-záéíóúñü]/gi, "").toUpperCase();
      if (acronyms.has(key)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

const SECTION_LABELS = [
  "formacion academica",
  "experiencia requerida",
  "experiencia especifica",
  "experiencia laboral",
  "cursos y/o programas de especializacion requeridos",
  "cursos y programas de especializacion",
  "programas de especializacion requeridos",
  "cursos de especializacion",
  "especializacion requerida",
  "especializacion",
  "cursos",
  "capacitacion",
  "diplomados",
  "conocimientos requeridos",
  "conocimientos tecnicos",
  "como postular",
  "postulacion",
  "proceso de seleccion",
  "indicaciones para postular",
  "presentacion de documentos",
  "cronograma",
  "requisitos minimos",
];

function isSectionHeading(value) {
  const text = normalize(value).replace(/[:.\-–—]+$/g, "");
  return SECTION_LABELS.some(label =>
    text === label ||
    text.startsWith(label + ":") ||
    text.startsWith(label + " ")
  );
}

// Busca una sección por su encabezado y recupera su contenido.
function extractSection($, labels) {
  const wanted = labels.map(normalize);
  const selectors = "h1,h2,h3,h4,h5,strong,b,p,li,td,th";
  let result = "";

  $(selectors).each((_, element) => {
    if (result) return;

    const node = $(element);
    const raw = clean(node.text());

    if (!raw || raw.length > 1000) return;

    const normalized = normalize(raw);
    const matched = wanted.find(label =>
      normalized === label ||
      normalized.startsWith(label + ":") ||
      normalized.startsWith(label + " ") ||
      normalized.startsWith(label + "-")
    );

    if (!matched) return;

    // Si el encabezado y el contenido están en el mismo elemento.
    const escaped = matched.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const inline = raw.replace(
      new RegExp("^" + escaped + "\\s*[:.\\-–—]?\\s*", "i"),
      ""
    ).trim();

    if (inline && normalize(inline) !== matched && inline.length > 2) {
      result = inline;
      return;
    }

    // Busca contenido posterior dentro del mismo bloque.
    const parent = node.parent();
    const parentText = clean(parent.text());

    if (parentText && parentText !== raw && parentText.length < 5000) {
      const index = parentText.toLowerCase().indexOf(raw.toLowerCase());

      if (index >= 0) {
        const remainder = parentText.slice(index + raw.length)
          .replace(/^[\s:.\-–—]+/, "")
          .trim();

        if (remainder && remainder.length > 2) {
          result = remainder;
          return;
        }
      }
    }

    // Busca elementos hermanos siguientes.
    const chunks = [];
    let next = node.next();
    let count = 0;

    while (next.length && count < 20) {
      if (next.is("h1,h2,h3,h4,h5")) break;

      const nextText = clean(next.text());

      if (nextText && isSectionHeading(nextText)) break;

      if (
        nextText &&
        nextText !== raw &&
        !chunks.includes(nextText) &&
        nextText.length < 2500
      ) {
        chunks.push(nextText);
      }

      next = next.next();
      count++;
    }

    if (chunks.length) {
      result = clean(chunks.join("\n"));
    }
  });

  return clean(result);
}

function extractFromLabels(text, labels) {
  const lines = text
    .split("\n")
    .map(clean)
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = normalize(lines[i]);

    const label = labels.find(item =>
      line === normalize(item) ||
      line.startsWith(normalize(item) + ":")
    );

    if (!label) continue;

    const inline = lines[i]
      .replace(
        new RegExp(
          "^" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "\\s*[:.\\-–—]?\\s*",
          "i"
        ),
        ""
      )
      .trim();

    if (inline && normalize(inline) !== normalize(label)) {
      return inline;
    }

    const following = [];

    for (let j = i + 1; j < lines.length && j <= i + 15; j++) {
      if (isSectionHeading(lines[j])) break;

      following.push(lines[j]);
    }

    if (following.length) return clean(following.join("\n"));
  }

  return "";
}

function extractDates(text) {
  const months = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    setiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };

  const normalized = normalize(text);

  // Ejemplo: "del 21 al 22 de octubre de 2026".
  const range = normalized.match(
    /(?:plazo para postular|presentacion de postulaciones|registro de postulacion|cronograma)[\s\S]{0,180}?(\d{1,2})\s*(?:y|al|a|hasta el|[-–])\s*(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})/i
  );

  if (range) {
    const [, first, last, month, year] = range;

    return {
      fechaInicio: `${year}-${months[month]}-${first.padStart(2, "0")}`,
      fechaCierre: `${year}-${months[month]}-${last.padStart(2, "0")}`,
    };
  }

  function singleDate(labels) {
    const labelPattern = labels.join("|");
    const match = text.match(
      new RegExp(
        "(?:" + labelPattern + ")[^\\n\\r]{0,180}?(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{1,2}\\s+de\\s+[a-záéíóú]+\\s+de\\s+\\d{4})",
        "i"
      )
    );

    if (!match) return "";

    const raw = match[1];
    const numeric = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

    if (numeric) {
      const [, day, month, yearRaw] = numeric;
      const year = yearRaw.length === 2 ? "20" + yearRaw : yearRaw;

      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const word = normalize(raw).match(
      /^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/
    );

    if (word && months[word[2]]) {
      return `${word[3]}-${months[word[2]]}-${word[1].padStart(2, "0")}`;
    }

    return "";
  }

  return {
    fechaInicio: singleDate([
      "inicio de postulacion",
      "fecha de inicio",
      "inscripciones desde",
      "fecha inicial",
    ]),
    fechaCierre: singleDate([
      "fecha de cierre",
      "fecha limite",
      "cierre de postulacion",
      "hasta el",
      "plazo para postular",
    ]),
  };
}

function extractTime(text) {
  const relevant = text.match(
    /(?:hora limite|hora de cierre|plazo para postular|hasta las|hasta la hora|horario de postulacion)[\s\S]{0,300}/i
  );

  const area = relevant ? relevant[0] : text;
  const matches = [...area.matchAll(
    /(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?/gi
  )];

  if (!matches.length) return "";

  const last = matches[matches.length - 1];
  let hour = Number(last[1]);
  const minute = Number(last[2]);
  const suffix = (last[3] || "").toLowerCase().replace(/[.\s]/g, "");

  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;

  if (hour > 23 || minute > 59) return "";

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = String(body?.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, mensaje: "Pega el enlace de una convocatoria." },
        { status: 400 }
      );
    }

    let url;

    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { success: false, mensaje: "La URL no es válida." },
        { status: 400 }
      );
    }

    if (url.protocol !== "https:" || !HOSTS.has(url.hostname.toLowerCase())) {
      return NextResponse.json(
        { success: false, mensaje: "Solo se permiten enlaces HTTPS de convocatoriasdetrabajo.com." },
        { status: 400 }
      );
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChambaFijaImporter/1.0)",
        "Accept-Language": "es-PE,es;q=0.9",
      },
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, mensaje: `La página respondió con estado ${response.status}.` },
        { status: 502 }
      );
    }

    const html = await response.text();

    if (html.length > 5000000) {
      return NextResponse.json(
        { success: false, mensaje: "La página recibida es demasiado grande." },
        { status: 413 }
      );
    }

    const $ = cheerio.load(html);

    $("script,style,noscript,nav,footer,header,iframe,form").remove();

    const title = clean($("h1").first().text() || $("title").text());

    // Conserva saltos de línea para identificar apartados.
    const text = clean(
      $("body").text().replace(/\r/g, "").replace(/[ \t]+/g, " ")
    );

    const entidad = extractEntity(title);

    const modalidadMatch = text.match(
      /\b(CAS|D\.?\s*L\.?\s*728|D\.?\s*L\.?\s*276|prácticas preprofesionales|prácticas profesionales|prácticas|locación de servicios)\b/i
    );

    const sueldoMatch =
      text.match(
        /(?:remuneraci[oó]n|sueldo|retribuci[oó]n|ingreso mensual)[^\n]{0,100}?(S\/?\.?\s?[\d,]+(?:\.\d{2})?)/i
      ) ||
      text.match(/(S\/?\.?\s?[\d,]+(?:\.\d{2})?)/i);

    const vacantesMatch = text.match(
      /(?:n[uú]mero de vacantes|vacantes|plazas)\s*[:\-]?\s*(\d{1,4})/i
    );

    const ubicacion =
      extractSection($, [
        "ubicación",
        "ubicacion",
        "lugar de prestación",
        "lugar de labores",
        "departamento",
        "localidad",
      ]) || "Pasco";

    const formacion =
      extractSection($, [
        "formación académica",
        "formacion academica",
        "nivel educativo",
        "formación",
        "formacion",
      ]) ||
      extractFromLabels(text, [
        "Formación académica",
        "Formación",
        "Nivel educativo",
      ]);

    const experiencia =
      extractSection($, [
        "experiencia requerida",
        "experiencia específica",
        "experiencia especifica",
        "experiencia laboral",
        "experiencia",
      ]) ||
      extractFromLabels(text, [
        "Experiencia requerida",
        "Experiencia específica",
        "Experiencia laboral",
        "Experiencia",
      ]);

    const especializacion =
      extractSection($, [
        "cursos y/o programas de especialización requeridos",
        "cursos y/o programas de especializacion requeridos",
        "cursos y programas de especialización",
        "cursos y programas de especializacion",
        "programas de especialización requeridos",
        "programas de especializacion requeridos",
        "cursos de especialización",
        "cursos de especializacion",
        "especialización requerida",
        "especializacion requerida",
        "cursos y capacitaciones",
        "cursos",
        "especialización",
        "especializacion",
        "capacitación",
        "capacitacion",
        "diplomados",
        "conocimientos requeridos",
        "conocimientos técnicos",
        "conocimientos tecnicos",
      ]) ||
      extractFromLabels(text, [
        "Cursos y/o programas de especialización requeridos",
        "Cursos y programas de especialización",
        "Programas de especialización requeridos",
        "Cursos de especialización",
        "Especialización requerida",
        "Cursos",
        "Capacitación",
        "Diplomados",
        "Conocimientos requeridos",
        "Conocimientos técnicos",
      ]);

    const comoPostular =
      extractSection($, [
        "cómo postular",
        "como postular",
        "indicaciones para postular",
        "instrucciones para postular",
        "postulación",
        "postulacion",
        "proceso de selección",
        "proceso de seleccion",
        "presentación de documentos",
        "presentacion de documentos",
        "envío de documentos",
        "envio de documentos",
      ]) ||
      extractFromLabels(text, [
        "Cómo postular",
        "Como postular",
        "Indicaciones para postular",
        "Instrucciones para postular",
        "Proceso de selección",
        "Presentación de documentos",
        "Envío de documentos",
      ]);

    const { fechaInicio, fechaCierre } = extractDates(text);

    const data = {
      empresa: entidad || "",
      modalidad: modalidadMatch
        ? modalidadMatch[1].replace(/\s+/g, " ").toUpperCase()
        : "",
      titulo: title,
      ubicacion,
      vacantes: vacantesMatch ? vacantesMatch[1] : "",
      sueldo: sueldoMatch ? sueldoMatch[1].replace(/\s+/g, " ").trim() : "",
      fechaInicio,
      fechaVencimiento: fechaCierre,
      horaVencimiento: extractTime(text),
      formacion: formacion || "",
      experiencia: experiencia || "",
      especializacion: especializacion || "",
      comoPostular: comoPostular || "",

      // Los enlaces se completan manualmente en el panel.
      enlaceBases: "",
      enlacesExtras: [],
      descripcion: "",
    };

    const camposEncontrados = Object.entries(data).filter(([key, value]) => {
      if (
        ["enlaceBases", "enlacesExtras", "descripcion"].includes(key)
      ) {
        return false;
      }

      return typeof value === "string"
        ? Boolean(value)
        : Array.isArray(value) && value.length > 0;
    }).length;

    return NextResponse.json({
      success: true,
      data,
      advertencia:
        camposEncontrados < 6
          ? "Se extrajeron pocos campos. Revisa manualmente la convocatoria y las bases oficiales."
          : "Extracción completada. Verifica fechas, requisitos, cursos y procedimiento de postulación antes de guardar.",
    });
  } catch (error) {
    console.error("Error en importador de convocatorias:", error);

    return NextResponse.json(
      {
        success: false,
        mensaje:
          error?.name === "TimeoutError"
            ? "La página tardó demasiado en responder."
            : "No se pudo analizar la página. Comprueba la URL e inténtalo de nuevo.",
      },
      { status: 500 }
    );
  }
}
