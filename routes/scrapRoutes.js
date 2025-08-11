import express from "express";
import getHtml from "../utils/scrapers/getHtml.js";
import scraperProcess from "../utils/scraperProcess.js";
import { staticScraper } from "../utils/scrapers/_staticScraper.js";
import { runPipeline } from "../utils/scrapers/processScrap.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log('entro por ruta /scrap (routes)');
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

  try {
    const result = await staticScraper(url);
    res.json(result);
  } catch (err) {
    console.error("SCRAPE ERROR", err);
    res.status(500).json({ error: err.message });
  }
});


// Axios coloca y convierte el objeto JSON recibido, en req.body
router.post("/process", async (req, res) => {
  console.log('... end-point received: /process');
  const tarea = req.body;
  console.log("Tarea recibida:", tarea);

  runPipeline(tarea)
  // .then((result) => console.log(JSON.stringify(result, null, 2)))
  .then((result) =>     res.json(result))
  .catch(console.error);

  // try {
  //   // Scrape logic according to task processes
  //   const html = await getHtml(tarea.url, tarea.type);
  //   res.json(scraperProcess(html, tarea.process));
  // } catch (err) {
  //   console.error("SCRAPE ERROR", err);
  //   res.status(500).json({ error: err.message });
  // }
});

router.get("/puppe", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

  try {
    const result = await dynamicScraper(url);
    res.json(result);
  } catch (err) {
    console.error("PUPPE ERROR", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
