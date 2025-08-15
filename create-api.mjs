/**
 * Este fichero ......
 * Se ejecuta con <node create-api.mjs resourceName>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// El primer argumento posicional después de "node script.js"
const resourceName = process.argv[2];

let resourceDirName, resourceModelName;
// Valida que el resourceName existe y que cumple nomenclatura
try {
  ({ resourceDirName, resourceModelName } = checkResourceName(resourceName));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// Get DIR_ROOT in ES Modules (because this file is in dir root)
const DIR_ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIR_FATHER_RESOURCES = "APIS";
const DIR_TEMPLATE = "_template-v1";
const DIR_NUCLEO = "_nucleo";
const FILE_RESTART = "toolPaths.mjs";
const versions = ["v1"]; //-- version fija

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

//---------------------------------------
//--------- R U T I N A S - INI ---------
//---------------------------------------
function checkResourceName(input) {
  if (!input) {
    throw new Error(
      "❌ Debes indicar el nombre del recurso como primer argumento posicional"
    );
  }
  // Validar que solo contenga minúsculas y numeros (que sean al principio) y guiones medios
  const formatoValido = /^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/;
  if (!formatoValido.test(input)) {
    throw new Error(
      `Formato inválido: "${input}". Solo minúsculas (admite numeros, pero no al inicio) y guiones medios(-).`
    );
  }

  // Dividir en partes
  const partes = input.split("-");

  // Chequear que la última parte no sea plural simple
  const ultima = partes[partes.length - 1];
  if (ultima.endsWith("es") || ultima.endsWith("s")) {
    throw new Error(
      `No se permite que la última parte sea plural: "${ultima}".`
    );
  }

  // Modelo en PascalCase
  const modelo = partes
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return { resourceDirName: input, resourceModelName: modelo };
}
//---------------------------------------
//--------- R U T I N A S - FIN ---------
//---------------------------------------
