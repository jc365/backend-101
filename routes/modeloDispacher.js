const express = require("express");
const staticScraper = require("../utils/scrapers/staticScraper");
const dynamicScraper = require("../utils/scrapers/dynamicScraper");

const sites = {
  "example.com": "static",
  "reactjs.org": "dynamic",
  "tienda.com": "dynamic"
};

const router = express.Router();

router.get("/scrapeAuto", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

  const hostname = new URL(url).hostname.replace("www.", "");
  const type = sites[hostname];

  if (!type) {
    return res.status(400).json({
      error: `No hay tipo de scraping configurado para '${hostname}'`
    });
  }

  try {
    const result = type === "static"
      ? await staticScraper(url)
      : await dynamicScraper(url);

    res.json(result);
  } catch (err) {
    console.error("AUTO SCRAPE ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
