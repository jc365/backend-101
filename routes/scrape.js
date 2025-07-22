import express from 'express';
import { staticScraper } from '../utils/scrapers/staticScraper.js'

const router = express.Router();

router.get("/scrape", async (req, res) => {
  console.log('entro por ruta /scrape (routes)');
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

export default  router;
