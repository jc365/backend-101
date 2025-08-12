import { load } from 'cheerio';

/**
 * Extrae un resumen de etiquetas y ejemplos de un HTML.
 * @param {string} html - El contenido HTML ya renderizado
 * @returns {{ tagSummary: object, tagExamples: object }}
 */
export function analyzeTags(html) {
  const $ = load(html);
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

  return { tagSummary, tagExamples };
}
