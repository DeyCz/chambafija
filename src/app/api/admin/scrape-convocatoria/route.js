import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const ALLOWED_HOSTS = new Set(["www.convocatoriasdetrabajo.com", "convocatoriasdetrabajo.com"]);

function clean(value = "") {
  return String(value).replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function findSection($, labels) {
  const wanted = labels.map(x => x.toLowerCase());
  let result = "";

  $("h1,h2,h3,h4,strong,b,p,li,td,th").each((_, el) => {
    if (result) return;
    const heading = clean($(el).text()).toLowerCase().replace(/[:\s]+$/, "");
    if (!wanted.some(label => heading === label || heading.startsWith(label + ":"))) return;

    const inline = clean($(el).text()).replace(/^.*?:\s*/, "");
    if (inline && inline.toLowerCase() !== heading) {
      result = inline;
      return;
    }

    const next = $(el).next();
    if (next.length) result = clean(next.text());
    if (!result) {
      const parent = $(el).parent();
      const parentText = clean(parent.text());
      const headingText = clean($(el).text());
      result = clean(parentText.replace(headingText, ""));
    }
  });

  return result;
}

function findDate(text, labels) {
  const labelPattern = labels.join("|");
  const re = new RegExp(
    `(?:${labelPattern})[^\\n\\r]{0,80}?(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{1,2}\\s+de\\s+[a-záéíóú]+\\s+de\\s+\\d{4})`,
    "i"
  );
  const match = text.match(re);
  if (!match) return "";
  const raw = match[1];
  const numeric = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (numeric) {
    const [, a, b, c] = numeric;
    const year = c.length === 2 ? `20${c}` : c;
    // Las fechas numéricas de la web pueden variar de formato; asumir DD/MM/YYYY.
    return `${year}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
  }
  const months = {
    enero:"01", febrero:"02", marzo:"03", abril:"04", mayo:"05", junio:"06",
    julio:"07", agosto:"08", septiembre:"09", setiembre:"09", octubre:"10",
    noviembre:"11", diciembre:"12"
  };
  const word = raw.match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/i);
  if (word && months[word[2].toLowerCase()]) return `${word[3]}-${months[word[2].toLowerCase()]}-${word[1].padStart(2, "0")}`;
  return "";
}

function findTime(text) {
  const match = text.match(/(?:hora\s*(?:l[ií]mite|de cierre|de postulaci[oó]n)|hasta las?)\s*[:\-]?\s*(\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?)/i);
  if (!match) return "";
  const value = match[1].toLowerCase().replace(/\s/g, "").replace(/\./g, "");
  const parsed = value.match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
  if (!parsed) return "";
  let hour = Number(parsed[1]);
  const suffix = parsed[3];
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${parsed[2]}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = String(body?.url || "").trim();
    if (!rawUrl) {
      return NextResponse.json({ success: false, mensaje: "Pega el enlace de una convocatoria." }, { status: 400 });
    }

    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json({ success: false, mensaje: "La URL no es válida." }, { status: 400 });
    }

    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
      return NextResponse.json({ success: false, mensaje: "Solo se permiten enlaces HTTPS de convocatoriasdetrabajo.com." }, { status: 400 });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChambaFijaImporter/1.0)",
        "Accept-Language": "es-PE,es;q=0.9"
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, mensaje: `La página respondió con estado ${response.status}.` }, { status: 502 });
    }

    const html = await response.text();
    if (html.length > 5_000_000) {
      return NextResponse.json({ success: false, mensaje: "La página recibida es demasiado grande." }, { status: 413 });
    }

    const $ = cheerio.load(html);
    $("script,style,noscript,nav,footer,header,iframe").remove();

    const title = clean($("h1").first().text() || $("title").text());
    const text = clean($("body").text());
    const links = [];

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const label = clean($(el).text()) || "Enlace oficial";
      if (!href) return;
      try {
        const absolute = new URL(href, url).toString();
        if (absolute.startsWith("https://") && !links.some(x => x.url === absolute)) {
          if (/base|pdf|cronograma|anexo|postul|convocatoria|perfil|t[eé]rminos|referencia/i.test(`${label} ${absolute}`)) {
            links.push({ titulo: label.slice(0, 120), url: absolute });
          }
        }
      } catch {}
    });

    const modalidadMatch = text.match(/\b(CAS|D\.?\s*L\.?\s*728|D\.?\s*L\.?\s*276|prácticas(?:\s+preprofesionales|\s+profesionales)?|locación de servicios)\b/i);
    const sueldoMatch = text.match(/(?:remuneraci[oó]n|sueldo|retribuci[oó]n|ingreso mensual)[^S\d]{0,35}(S\/\.?\s?[\d,]+(?:\.\d{2})?)/i)
      || text.match(/(S\/\.?\s?[\d,]+(?:\.\d{2})?)/i);
    const vacantesMatch = text.match(/(?:n[uú]mero de vacantes|vacantes|plazas)\s*[:\-]?\s*(\d{1,4})/i);

    const entidad = findSection($, ["entidad", "entidad convocante", "institución", "institucion", "empresa"]);
    const ubicacion = findSection($, ["ubicación", "ubicacion", "lugar de prestación", "lugar de labores", "localidad"]);
    const formacion = findSection($, ["formación académica", "formacion academica", "requisitos mínimos", "requisitos minimos", "perfil del puesto", "requisitos"]);
    const experiencia = findSection($, ["experiencia", "experiencia requerida", "experiencia específica", "experiencia especifica"]);
    const especializacion = findSection($, ["cursos", "especialización", "especializacion", "capacitación", "capacitacion"]);
    const comoPostular = findSection($, ["cómo postular", "como postular", "postulación", "postulacion", "proceso de selección", "proceso de seleccion"]);

    const fechaInicio = findDate(text, ["fecha de inicio", "inicio de postulaci[oó]n", "desde el", "inscripciones desde"]);
    const fechaCierre = findDate(text, ["fecha de cierre", "fecha l[ií]mite", "cierre de postulaci[oó]n", "hasta el", "postulaci[oó]n hasta"]);

    const data = {
      empresa: entidad || "",
      modalidad: modalidadMatch ? modalidadMatch[1].replace(/\s+/g, " ").toUpperCase() : "",
      titulo: title,
      ubicacion: ubicacion || "Pasco",
      vacantes: vacantesMatch ? vacantesMatch[1] : "",
      sueldo: sueldoMatch ? sueldoMatch[1].replace(/\s+/g, " ").trim() : "",
      fechaInicio,
      fechaVencimiento: fechaCierre,
      horaVencimiento: findTime(text),
      formacion: formacion || "",
      experiencia: experiencia || "",
      especializacion: especializacion || "",
      comoPostular: comoPostular || "",
      enlaceBases: links[0]?.url || "",
      enlacesExtras: links.slice(1, 8),
      descripcion: `Fuente: ${url.toString()}`
    };

    const found = Object.values(data).filter(v => typeof v === "string" ? Boolean(v) : Array.isArray(v) && v.length).length;
    return NextResponse.json({
      success: true,
      data,
      fuente: url.toString(),
      advertencia: found < 6
        ? "Se extrajeron pocos campos automáticamente. Revisa el anuncio y las bases oficiales antes de publicar."
        : "Verifica fechas, remuneración, requisitos y enlaces oficiales antes de publicar."
    });
  } catch (error) {
    console.error("Error en importador de convocatorias:", error);
    return NextResponse.json({
      success: false,
      mensaje: error?.name === "TimeoutError"
        ? "La página tardó demasiado en responder."
        : "No se pudo analizar la página. Puede bloquear la petición o requerir otro método de extracción."
    }, { status: 500 });
  }
}
