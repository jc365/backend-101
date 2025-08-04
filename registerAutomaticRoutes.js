import fs from "fs";
import { dynamicImport, pathJoin } from "./APIS/_nucleo/toolPaths.mjs";

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
      fs.lstatSync(pathJoin(modulesBasePath, file)).isDirectory()
    );
  for (const resource of resources) {
    const resourcePath = pathJoin(modulesBasePath, resource);
    const files = fs.readdirSync(resourcePath);
    const routeFiles = files.filter((f) => /^routes-v\d+\.js$/.test(f));

    for (const routeFile of routeFiles) {
      const versionMatch = routeFile.match(/^routes-(v\d+)\.js$/);
      if (!versionMatch) continue;

      const version = versionMatch[1];
      const routePath = pathJoin(resourcePath, routeFile);

      try {
        const { default: router } = await dynamicImport(routePath);
        app.use(`${prefix}/${version}/${resource}s`, router);
        console.log(
          `✅ Dynamic route mount: ${prefix}/${version}/${resource}s`
        );
      } catch (err) {
        console.error(
          `❌ Error mounting route ${routeFile} by resource ${resource}\n`,
          err
        );
      }
    }
  }
}
