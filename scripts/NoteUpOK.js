// Ejecutar desde el directorio donde esta el .md con el siguiente cmd
// node C:\Users\jc\Documents\PROG\Projects\backend-101\scripts\NoteUp <file>

// const fs = require('fs');
// const fetch = require('node-fetch');
import path from "path";
import fs from "fs";
// import fetch from "node-fetch";

const mdPath = process.argv[2];
if (!mdPath) {
  console.log("Uso: node subirNotaFetch.js ruta/a/archivo.md");
  process.exit(1);
}
const content = fs.readFileSync(mdPath, "utf8");
const filename = path.basename(mdPath);

fetch("http://localhost:5050/api/notes/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ filename, content }),
})
  .then((res) => res.json())
  .then((data) => console.log("Respuesta:", data))
  .catch((err) => console.error(err));
