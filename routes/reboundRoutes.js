import express from 'express';
import axios from 'axios';

const router = express.Router();

// Invocation model: http://localhost:5050/rebound?url=https://tpdk.co.uk

// Reenvío GET
router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Falta parámetro url");
  }

  // Filtra solo las cabeceras que quieras reenviar; aquí se reenvían todos los headers excepto los de control
  const specialHeaders = { ...req.headers };
  // Quita headers poco útiles o conflictivos (ajusta según tus necesidades)
  delete specialHeaders.host;
  delete specialHeaders['content-length'];
  delete specialHeaders['accept-encoding'];
  // Puedes filtrar solo los que te interesen

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: specialHeaders,
    });
    res.send(response.data);
  } catch (err) {
    console.error(`Error llamando a ${url}: ${err.message}`);
    res.status(500).send(`Error llamando a ${url}: ${err.message}`);
  }
});

// Reenvío POST
router.post("/", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Falta parámetro url");
  }

  const specialHeaders = { ...req.headers };
  delete specialHeaders.host;
  delete specialHeaders['content-length'];
  delete specialHeaders['accept-encoding'];

  try {
    const response = await axios.post(url, req.body, {
      timeout: 10000,
      headers: specialHeaders,
    });
    res.send(response.data);
  } catch (err) {
    console.error(`Error llamando a ${url}: ${err.message}`);
    res.status(500).send(`Error llamando a ${url}: ${err.message}`);
  }
});

export default router;
