import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

/**
 * IMPORTANT. Varname <__dirname> it is essential, and using import does not automount it
 * (with require, it does). It is initialized with the dir where this module is (/routes)
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta para devolver un archivo HTML estático. Requiere el nombre como final de la url
router.get("/:page", (req, res) => {
  const page = req.params.page;
  //-- Si no existe el html da un error mostrando info sensible (estructura directorios)
  // res.sendFile(path.join(__dirname, "../static-pages", `${page}.html`));

  //-- Genera un error identico a cuando la ruta no existe (sin info sensible)
  res.sendFile(
    path.join(__dirname, "../static-pages", `${page}.html`),
    (err) => {
      if (err) {
        res.status(404).send(`Cannot GET ${req.originalUrl}`);
      }
    }
  );
});


export default router;
