// --- IMPORTS --- 
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CONSTANTES ---
const DIR_FATHER_RESOURCES = "APIS";
const DIR_TEMPLATE = "_template-v1";
const DIR_NUCLEO = "_nucleo";
const FILE_RESTART = "toolPaths.mjs";
const versions = ["v1"];

// --- UTILS ---
// --- UTILS ---
// --- UTILS ---
function checkResourceName(input) {
  if (!input) {
    throw new Error(
      "❌ Debes indicar el nombre del recurso como primer argumento posicional"
    );
  }
  // Validar minúsculas, números (no al inicio de segmento), guión
  const formatoValido = /^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/;
  if (!formatoValido.test(input)) {
    throw new Error(
      `❌ Formato inválido: "${input}". Solo minúsculas (admite números, pero no al inicio) y guiones (-).`
    );
  }

  // Prohíbe plural al final
  const partes = input.split("-");
  const ultima = partes[partes.length - 1];
  if (ultima.endsWith("es") || ultima.endsWith("s")) {
    throw new Error(`❌ No se permite que la última parte sea plural: "${ultima}".`);
  }

  // PascalCase para modelo
  const modelo = partes.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  return { resourceDirName: input, resourceModelName: modelo };
}

// --- MAIN EXECUTION ---
// --- MAIN EXECUTION ---
// --- MAIN EXECUTION ---
async function main() {
  const resourceName = process.argv[2]; //-- recogida de resourceName pasado en la linea comandos

  let resourceDirName, resourceModelName;
  try {
    ({ resourceDirName, resourceModelName } = checkResourceName(resourceName));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // Directorios base
  const DIR_ROOT = path.dirname(fileURLToPath(import.meta.url));
  const basePath = path.join(DIR_ROOT, DIR_FATHER_RESOURCES, resourceDirName);
  const patronPath = path.join(DIR_ROOT, DIR_FATHER_RESOURCES, DIR_TEMPLATE);

  // Crear directorio si no existe
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  // Copiar y modificar archivos del template
  ["controller.js", "model.js"].forEach(file => {
    const src = path.join(patronPath, file);
    const dest = path.join(basePath, file);
    fs.copyFileSync(src, dest);
    // Sólo el model necesita ajuste
    if (file === "model.js") {
      let modelContent = fs.readFileSync(dest, "utf-8");
      modelContent = modelContent.replace(
        /export default mongoose\.model\(['"`][^'"`]+['"`],/,
        `export default mongoose.model('${resourceModelName}',`
      );
      fs.writeFileSync(dest, modelContent);
    }
  });

  // Copiar rutas por versión
  const routeSrc = path.join(patronPath, "routes.js");
  versions.forEach(version => {
    const routeDest = path.join(basePath, `routes-${version}.js`);
    fs.copyFileSync(routeSrc, routeDest);
  });

  // Forzar restart tools
  const fileRestart = path.join(DIR_ROOT, DIR_FATHER_RESOURCES, DIR_NUCLEO, FILE_RESTART);
  const restartContent = fs.readFileSync(fileRestart, "utf-8");
  fs.writeFileSync(fileRestart, restartContent);

  // Mensajes finales
  console.log(
    `✅ Módulo '${resourceName}' generado en '${basePath}' con versiones [${versions.join(", ")}]`
  );
  console.log(
    `[*] Recuerda editar ...\\${path.join(DIR_FATHER_RESOURCES, resourceDirName, "model.js")} para definir el esquema.`
  );
  console.log("[*] Rutas de esta API montadas automaticamente (ver log del server)");
  console.log("[*] Si quieres desactivar el montaje automatico, renombra el fichero de rutas anteponiendo un guion bajo (_routes-vX.js)");
  console.log("");
}

// --- Lanzar el main ---
main();
