import fs from "fs";
import { dynamicImport, pathJoin, documentationAdapted } from "./toolPaths.mjs";

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
        const fullRoute = `${prefix}/${version}/${resource}s`; //--pluraliza las rutas
        const docRoute = `${fullRoute}/docu`;

        // Ruta de documentación vinculada a este recurso/version
        app.get(docRoute, (req, res) => {
          const singular = resource.endsWith("s")
          ? resource.slice(0, -1)
          : resource;
          const html = documentationAdapted(singular, version);
          res.type("html").send(html);
        });
        // console.log(`📄 Documen route mount: ${docRoute}`);

        // Rutas del fichero de rutas
        app.use(fullRoute, router);
        console.log(`✅ Dynamic route mount: ${fullRoute}`);
      } catch (err) {
        console.error(
          `❌ Error mounting route ${routeFile} by resource ${resource}\n`,
          err
        );
      }
    }
  }
}
