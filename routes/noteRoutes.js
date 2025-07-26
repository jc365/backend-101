import express from "express";
import Note from "../db/noteModel.js";

const router = express.Router();

//-- limit max page size
const MAX_PAGE_SIZE = 10;

// Endpoint 1: Búsqueda avanzada paginada por texto en título y contenido
router.get("/search", async (req, res) => {
  let { q = "", page = 1, pageSize = 10 } = req.query;
  page = parseInt(page, 10) || 1;
  pageSize = parseInt(pageSize, 10);

  if (isNaN(pageSize) || pageSize < 1) pageSize = MAX_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  // Construimos filtro con búsqueda AND para cada término en título o contenido
  const terms = q.trim().split(/\s+/).filter(Boolean);
  const filter = terms.length
    ? {
        $and: terms.map((t) => ({
          $or: [
            { content: { $regex: t, $options: "i" } },
            { title: { $regex: t, $options: "i" } },
          ],
        })),
      }
    : {};

  try {
    const total = await Note.countDocuments(filter);
    const items = await Note.find(filter, { title: 1 }) // solo títulos e _id
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.json({ items, total, pageSize });
  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

// Endpoint 2: Obtener el contenido completo de una nota por su ID
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).exec();
    //-- Con lo siguiente, seleccionamos los campos a devolver
    // const note = await Note.findById(req.params.id, {
    //   title: 1,
    //   content: 1,
    // }).exec();
    if (!note) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    res.json(note);
  } catch (err) {
    console.error("Error obteniendo nota:", err);
    res.status(500).json({ error: "Error obteniendo nota" });
  }
});

// Endpoint 3: Subir/crear una nueva nota desde Markdown raw
router.post("/upload", async (req, res) => {
  const { filename, title, content, tags } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Falta el campo 'content'" });
  }

  // // Extraemos el título desde Markdown (primera línea que empiece con '# ')
  // const titleMatch = content.match(/^# (.+)$/m);
  // const title = titleMatch ? titleMatch[1] : filename || "Sin título";

  const doc = {
    filename,
    title,
    content,
    tags,
    createdAt: new Date(),
  };

  try {
    const note = new Note(doc);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creando nota:", error);
    res.status(500).json({ error: "Error creando nota" });
  }
});

export default router;
