import express from "express";
// import { staticScraper } from "../utils/scrapers/staticScraper.js";
import getHtml from "../utils/scrapers/getHtml.js";
import scraperProcess from "../utils/scraperProcess.js";

const router = express.Router();
const ruta = "/process";

// Axios coloca y convierte el objeto JSON recibido, en req.body
router.post(ruta, async (req, res) => {
  console.log(`... end-point received: ${ruta}`);
  const tarea = req.body;
  console.log("Tarea recibida:", tarea);

  try {
    // Scrape logic according to task processes
    const html = await getHtml(tarea.url, tarea.type);
    res.json(scraperProcess(html, tarea.process));
  } catch (err) {
    console.error("SCRAPE ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
