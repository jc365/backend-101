/**
 * Este fichero ......
 * Se ejecuta con <node create-api.mjs resourceName>
 */
import fs from "fs";
import path from "path";
// import minimist from "minimist";
import { fileURLToPath } from "url";

const DIR_FATHER_RESOURCES = "APIS";
const DIR_TEMPLATE = "_template-v1";
const DIR_NUCLEO = "_nucleo";
const FILE_RESTART = "toolPaths.mjs";

// Función para normalizar nombre recurso 
function normalizeResourceName(name) {
  const lower = name.toLowerCase();
  const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
  return { resourceDirName: lower, resourceModelName: capitalized };
}

// Función de validación para el nombre del recurso
function validarNombreRecurso(nombre) {
  // Debe empezar por letra, seguido de letras/números/guion bajo o medio
  const patron = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
  return patron.test(nombre);
}

// Parsear argumentos posicionales (sin usar minimist para flags)
const resourceName = process.argv[2]; // El primer argumento posicional después de "node script.js"

if (!resourceName) {
  console.error(
    "❌ Debes indicar el nombre del recurso como primer argumento posicional"
  );
  process.exit(1);
}

if (!validarNombreRecurso(resourceName)) {
  console.error(`❌ Nombre de recurso inválido: "${resourceName}". 
  Debe empezar por una letra y solo puede contener letras, números, guion bajo o guion medio.`);
  process.exit(1);
}

// Versión fija
const versions = ["v1"];

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
  const routeDest = path.join(basePath, `routes-${version}.js`);
  fs.copyFileSync(routeSrc, routeDest);
});

// --- 5. Force restart server (none change)
const fileRestart = path.join(
  DIR_ROOT,
  DIR_FATHER_RESOURCES,
  DIR_NUCLEO,
  FILE_RESTART
);
let restarContent = fs.readFileSync(fileRestart, "utf-8");
fs.writeFileSync(fileRestart, restarContent);

console.log(
  `✅ Módulo '${resourceName}' generado en '${basePath}' con versiones [${versions.join(
    ", "
  )}]`
);
// console.log("✅ Módulo creado con éxito.");
console.log(
  `[*] Recuerda editar el archivo ...\\${path.join(
    DIR_FATHER_RESOURCES,
    resourceDirName,
    "model.js"
  )} para definir el esquema.`
);
console.log(
  "[*] Rutas de esta API montadas automaticamente (ver log del server)"
);
console.log(
  "[*] Si quieres desactivar el montaje automatico, renombre el fichero"
);
console.log(
  "[*]    de rutas deseado, anteponiendo un guion_bajo a su nombre (_routes-vX.js)"
);
console.log("");
