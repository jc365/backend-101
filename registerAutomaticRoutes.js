import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Recorre el 'modulesBasePath' y en cada subdirectorio que encuentra, busca ficheros con el
 * patron 'routes-vX'. Cada vez que encuentra uno, lo importa dinamicamente y lo monta en
 * <{prefix}/{version}/{resource}s>  (el nombre del recurso lo toma del directorio).
 * Para desactivar este registro automatico, renombra 'routes-vX' a '_routes-vX'
 * @param {*} app
 * @param {*} modulesBasePath
 * @param {*} prefix
 */
export default async function registerAutomaticRoutes(
  app,
  modulesBasePath,
  prefix = "/api"
) {
  const resources = fs
    .readdirSync(modulesBasePath)
    .filter((file) =>
      fs.lstatSync(path.join(modulesBasePath, file)).isDirectory()
    );
  for (const resource of resources) {
    const resourcePath = path.join(modulesBasePath, resource);
    const files = fs.readdirSync(resourcePath);
    const routeFiles = files.filter((f) => /^routes-v\d+\.js$/.test(f));
    for (const routeFile of routeFiles) {
      const versionMatch = routeFile.match(/^routes-(v\d+)\.js$/);
      if (!versionMatch) continue;
      const version = versionMatch[1];
      const routePath = path.join(resourcePath, routeFile);
      const routeURL = pathToFileURL(routePath).href;
      try {
        const { default: router } = await import(routeURL);
        app.use(`${prefix}/${version}/${resource}s`, router);
        console.log(`✅ Ruta montada: ${prefix}/${version}/${resource}s`);
      } catch (err) {
        console.error(
          `❌ Error montando ruta ${routeFile} para recurso ${resource}:`,
          err
        );
      }
    }
  }
}
