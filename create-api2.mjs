import fs from "fs";
import path from "path";
import minimist from "minimist";
import { fileURLToPath } from "url";

// Función para normalizar nombre recurso
function normalizeResourceName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Nombre de recurso inválido");
  }
  const lower = name.toLowerCase();
  const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
  return { dirName: lower, modelName: capitalized };
}

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parsear argumentos
const args = minimist(process.argv.slice(2));
const resourceName = args.name;
const versions = args.versions ? args.versions.split(",") : ["v1"];

if (!resourceName) {
  console.error("❌ Debes indicar el nombre del recurso con --name");
  process.exit(1);
}

const { dirName, modelName } = normalizeResourceName(resourceName);
console.log("recurso:", dirName, modelName);

const basePath = path.join(__dirname, "midir", dirName);
const patronPath = path.join(__dirname, "midir", "patron-base-v3");

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

// --- 1. Copiar controller.js desde patron
const controllerSrc = path.join(patronPath, "controller.js");
const controllerDest = path.join(basePath, "controller.js");
fs.copyFileSync(controllerSrc, controllerDest);

// --- 2. Copiar model.js desde patron, y luego modificar la última línea para poner el nombre del modelo

const modelSrc = path.join(patronPath, "model_prov.js");
const modelDest = path.join(basePath, "model_prov.js");
let modelContent = fs.readFileSync(modelSrc, "utf-8");

// Aquí asumimos que la última línea del model.js plantilla es algo como:
// export default mongoose.model('Recurso', resourceSchema);
// Lo que haremos es buscar esa línea y reemplazar el nombre del modelo por el que toca:
// Para mayor seguridad, lo buscamos con regex

modelContent = modelContent.replace(
  /export default mongoose\.model\(['"`][^'"`]+['"`],/,
  `export default mongoose.model('${modelName}',`
);

// Guardamos el model.js modificado
fs.writeFileSync(modelDest, modelContent);

// --- 3. Copiar rutas y adaptarlas por versions
const routeSrc = path.join(patronPath, "routes.js");
versions.forEach((version) => {
  const routeDest = path.join(basePath, `routes-${version}.js`);
  fs.copyFileSync(routeSrc, routeDest);
});

console.log(
  `✅ Módulo '${resourceName}' generado en '${basePath}' con versiones [${versions.join(
    ", "
  )}]`
);
console.log("✅ Módulo creado con éxito.");
console.log(
  `Recuerda editar el archivo ${path.join(
    dirName,
    "model.js"
  )} para definir el esquema.`
);
console.log(
  "Añade o modifica tus endpoints personalizados en las rutas y el controller si es necesario."
);
console.log(
  "Luego, registra el nuevo módulo en server.js o usa el registrador automático si lo tienes."
);
