/**
 * The calculation of the constant ROOT_DIR may need adjustment
 * if the location of this file is changed.
 */
import { replaceAdvanced } from "./common-utils.js";
import { marked } from "marked";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Constant with root directory of project */
export const ROOT_DIR = path.resolve(__dirname, "../../");

/** Function like path.join without import path */
export const pathJoin = (...paths) => path.join(...paths);

/** Function-helper (ESM pure) to dynamic imports */
export const dynamicImport = (filePath) => {
  return import(pathToFileURL(filePath));
};

export function documentationAdapted(replace = "resource", version ='v1') {
  const mdPath = path.join(ROOT_DIR, "APIS", "_nucleo", "docu.md");
  const data = fs.readFileSync(mdPath, "utf8");
  // Adaptacion del texto y conversion de markdown a html
  const markdownModificado1 = replaceAdvanced(data, "item", replace);
  const markdownModificado2 = replaceAdvanced(markdownModificado1, "/v1/", `/${version}/`);
  const htmlMarkdown = marked.parse(markdownModificado2);

  const htmlFinal = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Markdown Servido</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; line-height: 1.6; }
          pre { background: #f4f4f4; padding: 1em; overflow-x: auto; }
          code { background: #eee; padding: 0.2em 0.4em; border-radius: 4px; }
        </style>
      </head>
      <body>
        ${htmlMarkdown}
      </body>
      </html>
    `;

  return htmlFinal;
}
