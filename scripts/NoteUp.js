import fs from "fs";
import path from "path";

const mdPath = process.argv[2];
if (!mdPath) {
  console.log("Uso: node subirNota.js ruta/al/archivo.md");
  process.exit(1);
}

if (!fs.existsSync(mdPath)) {
  console.error("Archivo no encontrado:", mdPath);
  process.exit(2);
}

const filename = path.basename(mdPath);

const lines = fs.readFileSync(mdPath, "utf-8").split(/\r?\n/);

// Línea 1: título (buscamos línea que empiece con '# ')
let title = "";
for (const line of lines) {
  const matchTitle = line.match(/^# (.+)$/);
  if (matchTitle) {
    title = matchTitle[1];
    break;
  }
}

// Línea 2 (o segunda línea útil) para detectar tags:
// Buscamos la primera línea que contenga 'tags:' (ignorando mayúsculas/minúsculas)
let tags = [];
for (const line of lines) {
  if (/^\s*tags:/i.test(line)) {
    // Extraemos las palabras después de 'tags:'
    const tagString = line.split(/tags:/i)[1].trim();
    if (tagString.length > 0) {
      // Separar por espacios, filtrar vacíos y convertir a array
      tags = tagString.split(/\s+/).filter(Boolean);
    }
    break;
  }
}

// El contenido completo (incluyendo esas líneas) para guardar
const content = lines.join("\n");

// Preparamos el documento para enviar al backend o guardar
const doc = {
  filename: path.basename(mdPath),
  title: title || path.basename(mdPath),
  content,
  tags,
  createdAt: new Date(),
};

console.log("Título:", doc.title);
console.log("Tags:", doc.tags);
console.log("Contenido inicial:", content.substring(0, 100), "...");


fetch("http://localhost:5050/api/notes/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(doc),
})
  .then((res) => res.json())
  .then((data) => console.log("Respuesta:", data))
  .catch((err) => console.error(err));

