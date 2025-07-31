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
// router.post("/upload", async (req, res) => {
//   const { filename, content } = req.body;
//   debugger;
//   console.log('entro a uppload', req.body);
//   if (!content) {
//     return res.status(400).json({ error: 'Content not exist'});
//   }

//   const title = getTitle(content);
//   if (!title) return res.status(400).json({ error: "Title not found" });
//   const tags = getTags(content);

//   const dataNote = {
//     filename,
//     title,
//     content,
//     tags,
//     createdAt: new Date(),
//   };

//   // ---------------

//     // 4. Realiza el upsert discriminando por titulo
//     try {
//     const resultado = await Note.findOneAndUpdate(
//       { title },                   // discrimina add/replace
//       { $set: dataNote },        
//       { upsert: true, new: true, includeResultMetadata: true }
//     );

//     // 5. Responde si fue insert o update
//     if (resultado.lastErrorObject.updatedExisting) {
//       console.log('update');
//       res.status(201).json({ operacion: 'update', libro: resultado });
//     } else {
//       console.log('create');
//       res.status(2201).json({ operacion: 'insert', libro: resultado });
//     }
//   } catch (err) {
//     res.status(500).json({ error: 'Error uploading note' });
//   }

//   // // ---------------
//   // try {
//   //   const note = new Note(doc);
//   //   await note.save();
//   //   res.status(201).json(note);
//   // } catch (error) {
//   //   console.error("Error creando nota:", error);
//   //   res.status(500).json({ error: "Error creando nota" });
//   // }
// });

router.post("/upload", async (req, res) => {
  const { filename, content } = req.body;
  if (!content) {
    return res.status(400).json({ status: "error", message: 'Content not exist' });
  }

  const title = getTitle(content);
  if (!title) {
    return res.status(400).json({ status: "error", message: "Title not found" });
  }

  const tags = getTags(content);

  const dataNote = {
    filename,
    title,
    content,
    tags,
    createdAt: new Date(),
  };

  try {
    const resultado = await Note.findOneAndUpdate(
      { title },               // filtro discriminante (upsert)
      { $set: dataNote },      
      { upsert: true, new: true, includeResultMetadata: true }
    );

    if (resultado.lastErrorObject.updatedExisting) {
      // Update
      return res.status(200).json({
        status: "success",
        operacion: "update",
        data: resultado
      });
    } else {
      // Create
      return res.status(201).json({
        status: "success",
        operacion: "insert",
        data: resultado
      });
    }
  } catch (err) {
    console.error('Error uploading note:', err);
    return res.status(500).json({
      status: "error",
      message: "Error uploading note"
    });
  }
});


// PATCH /api/notes/:id   -> Actualizar título nota
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "El título es obligatorio" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Error actualizando título:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// DELETE /api/notes/:id  -> Borrar nota
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("Error borrando nota:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

function getTitle(content) {
  const titleMatch = content.match(/^#{1,6}\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

function getTags(content, sep = " ") {
  const tagLineMatch = content.match(/^\s*tags:\s*(.*)$/im);
  if (tagLineMatch && tagLineMatch[1]) {
    return tagLineMatch[1]
      .split(sep)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}


export default router;
