import express from 'express';
import Note from '../db/noteModel.js';

const router = express.Router();

// Endpoint 1: búsqueda simple por texto en campo "content"
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Se requiere query param "q"' });

  try {
    // Búsqueda con regex insensible (puedes optimizar con full-text index si quieres)
    const cursor = db.collection('notes').find(
      { content: { $regex: q, $options: 'i' } },
      { projection: { title: 1 } } // solo titulo y _id
    ).limit(20);

    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// Endpoint 2: obtener contenido markdown por id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const note = await db.collection('notes').findOne({ _id: new ObjectId(id) }, { projection: { title: 1, content: 1 } });
    if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo nota' });
  }
});


// Endpoint 3: upload Note
router.post('/upload', async (req, res) => {
  const { filename, content } = req.body;
  if (!content) return res.status(400).json({ error: "Falta el campo 'content'" });

  // Extrae el título del markdown
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : filename || "Sin título";

  // Inserta en la colección
  const doc = {
    filename: filename || undefined,
    title,
    content,
    createdAt: new Date()
  };
  try {
    // Reception object to insert in req.body
    const note = new Note(doc); 
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creando nota:', error);
    res.status(500).json({ error: 'Error creando nota' });
  }

  // await req.app.locals.db.collection('notes').insertOne(doc);
  // res.json({ ok: true, title });
});



export default router;
