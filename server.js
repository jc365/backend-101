// server.js

import express from 'express';
import cors from 'cors';
import scrape from './routes/scrape.js'
import puppe from './routes/puppe.js'

const app = express();
const PORT = 5050;

app.use(cors());

// Aquí importas todas tus rutas
app.use("/", scrape, puppe);

app.listen(PORT, () => {
  console.log(`[SERVER] Escuchando en http://localhost:${PORT}`);
});
