import express from 'express';
import { dynamicScraper } from '../utils/scrapers/dynamicScraper.js'

const router = express.Router();

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

export default  router;
