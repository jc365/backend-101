# Claro, tu idea es sencilla y perfectamente válida para esta etapa inicial. Puedes leer la línea 1 para obtener el título y luego leer la línea 2, y si contiene la palabra `tags:`, extraer el resto de esa línea considerando que las palabras posteriores son los tags separados por espacios, convertirlo en array, y guardar ese array en el campo `tags` de la colección.

    tags: personal AI notas manuel_sanchez

Aquí te dejo un ejemplo práctico de cómo hacer esto en tu script de Node.js para cargar la nota desde un `.md` sin necesidad de usar `gray-matter` o frontmatter YAML, sino con esa lógica simple:

```js
import fs from "fs";
import path from "path";

const mdPath = process.argv[2];
if (!mdPath) {
  console.log("Uso: node subirNota.js ruta/al/archivo.md");
  process.exit(1);
}
