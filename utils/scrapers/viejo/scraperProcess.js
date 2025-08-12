import { load as cheerioLoad } from "cheerio";

/**
 * Recopila los tags configurados mediante cheerio
 * @param {string} html - El contenido HTML recibido en la respuesta.
 * @param {array} process - Procesos a realizar. Cada item tiene step y selectors.
 * @returns {{ data: array de datos recogidos de la pagina }}
 */
export default function scraperProcess(html, processList) {
  console.log("Process: ", processList);
  let out = html;
  // const $ = cheerioLoad(html);

  processList.forEach((process) => {
    console.log("Current process:", process);
    // Busca la función asociada y la ejecuta
    const funcion = procesosDisponibles[process.step];
    if (funcion) {
      out = funcion(out);
    } else {
      console.warn("No existe el proceso:", nombreProceso);
    }
  });
  
  const $ = cheerioLoad(html);
  const data = [];
  $("a").each((index, element) => {
    data.push({
      text: index + " - " + $(element).text(),
      href: $(element).attr("href"),
    });
  });

  return data;
  return out;
}

function descargarHTML() {
  console.log("Descargando HTML de.... (mentira ya llega descargado)");
  // ... lógica de scraping
}

function extraerDatos() {
  console.log("Extrayendo datos");
}

function guardarEnBD() {
  console.log("Guardando en la base de datos");
}

function summaryTags(html) {
   console.log("summaryTags");
  const $ = cheerioLoad(html);
  const tagSummary = {};
  const tagExamples = {};

  $("*").each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;

    tagSummary[tag] = (tagSummary[tag] || 0) + 1;

    if (!tagExamples[tag]) tagExamples[tag] = [];
    if (tagExamples[tag].length < 3) {
      const text = $(el).text().trim().slice(0, 100);
      const attrs = Object.fromEntries(Object.entries(el.attribs || {}));
      tagExamples[tag].push({ text, attrs });
    }
  });
  return tagSummary.concat(tagExamples);
  // return { tagSummary, tagExamples };
}


const procesosDisponibles = {
  descargarHTML: descargarHTML,
  extraerDatos: extraerDatos,
  guardarEnBD: guardarEnBD,
  summaryTags: summaryTags,
};
