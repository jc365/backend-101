import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const app = express();
app.use(express.json());

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta base donde están definidos los módulos versionados
const modulesBasePath = path.join(__dirname, 'midir');

async function mountRoutes() {
  // Leer carpetas dentro de zzmodules (cada carpeta es un recurso)
  const resources = fs.readdirSync(modulesBasePath).filter(file => {
    const fullPath = path.join(modulesBasePath, file);
    return fs.lstatSync(fullPath).isDirectory();
  });

  // Por cada recurso buscar rutas versionadas y montar
  for (const resource of resources) {
    const resourcePath = path.join(modulesBasePath, resource);
    const files = fs.readdirSync(resourcePath);
    // Filtrar archivos que respeten el patrón routes-vX.js (v1, v2, etc)
    const routeFiles = files.filter(f => /^routes-v\d+\.js$/.test(f));

    for (const routeFile of routeFiles) {
      const versionMatch = routeFile.match(/^routes-(v\d+)\.js$/);
      if (!versionMatch) continue;

      const version = versionMatch[1]; // e.g. v1, v2
      const routePath = path.join(resourcePath, routeFile);
      const routeURL = pathToFileURL(routePath).href;
      try {
        // Dynamic import of routes
        const { default: router } = await import(routeURL);
        app.use(`/api/${version}/${resource}s`, router);
        console.log(`✅ Ruta montada: /api/${version}/${resource}s`);
      } catch (err) {
        console.error(`❌ Error montando ruta ${routeFile} para recurso ${resource}:`, err);
      }
    }
  }
}

// Ejecutar montaje e iniciar servidor
mountRoutes()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error en montaje de rutas:', err);
  });

export default app;
