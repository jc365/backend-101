/**
 * Este fichero ......
 * Se ejecuta con <node create-api.mjs --name ManOLO  --versions v1,v2>
 */
import fs from "fs";
import path from "path";
import minimist from "minimist";
import { fileURLToPath } from "url";

const DIR_FATHER_RESOURCES = "APIS";
const DIR_TEMPLATE = "_template-v1";

// Función para normalizar nombre recurso (parm --name)
function normalizeResourceName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Nombre de recurso inválido");
  }
  const lower = name.toLowerCase();
  const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
  return { resourceDirName: lower, resourceModelName: capitalized };
}

// Parsear argumentos
const args = minimist(process.argv.slice(2));
const resourceName = args.name;
const versions = args.versions ? args.versions.split(",") : ["v1"];

if (!resourceName) {
  console.error("❌ Debes indicar el nombre del recurso con --name");
  process.exit(1);
}

// Get DIR_ROOT in ES Modules (because this file is in dir root)
const DIR_ROOT = path.dirname(fileURLToPath(import.meta.url));

const { resourceDirName, resourceModelName } =
  normalizeResourceName(resourceName);
console.log(`Creating infrastructure for resource ...`);

const basePath = path.join(DIR_ROOT, DIR_FATHER_RESOURCES, resourceDirName);
const patronPath = path.join(DIR_ROOT, DIR_FATHER_RESOURCES, DIR_TEMPLATE);

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

// --- 1. Copiar controller.js desde patron
const controllerSrc = path.join(patronPath, "controller.js");
const controllerDest = path.join(basePath, "controller.js");
fs.copyFileSync(controllerSrc, controllerDest);

// --- 2. Copiar model.js desde patron
const modelSrc = path.join(patronPath, "model.js");
const modelDest = path.join(basePath, "model.js");
let modelContent = fs.readFileSync(modelSrc, "utf-8");

// --- 3. Modification of the export with the resource name
modelContent = modelContent.replace(
  /export default mongoose\.model\(['"`][^'"`]+['"`],/,
  `export default mongoose.model('${resourceModelName}',`
);
fs.writeFileSync(modelDest, modelContent);

// --- 4. Copiar rutas y adaptarlas por versions
const routeSrc = path.join(patronPath, "routes.js");
versions.forEach((version) => {
  const routeDest = path.join(basePath, `_routes-${version}.js`);
  fs.copyFileSync(routeSrc, routeDest);
});

console.log(
  `✅ Módulo '${resourceName}' generado en '${basePath}' con versiones [${versions.join(
    ", "
  )}]`
);
// console.log("✅ Módulo creado con éxito.");
console.log(
  `[*] Recuerda editar el archivo ${path.join(
    resourceDirName,
    "model.js"
  )} para definir el esquema.`
);
console.log("[*] Para activar/registrar un fichero de rutas en el server:");
console.log("[*]   1. Elimina el guion bajo del fichero de rutas..");
console.log("[*]   2. Para y vuelve a arrancar el server con <npm run div>");
console.log("[*]   3. Las rutas son registradas automaticamente");
console.log("");
