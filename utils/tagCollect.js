import { load } from 'cheerio';

/**
 * Recopila los tags configurados mediante cheerio
 * @param {string} html - El contenido HTML recibido en la respuesta
 * @returns {{ data: array de datos recogidos de la pagina }}
 */
export function collectTags(html) {
  const $ = load(html);

  const data = [];
  $("a").each((index, element) => {
    data.push({
      text: $(element).text(),
      href: $(element).attr("href"),
    });
  });

  return data;
}
