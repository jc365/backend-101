const express = require("express");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Servidor Express (backend) funcionando");
});

app.get("/scrapeMEZCLADO", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    console.log("[SCRAPE] Accediendo a:", url);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // 👇 Extraer resumen de etiquetas
    const tagStats = {};
    const tagSamples = {};

    $("*").each((i, el) => {
      const tag = el.tagName?.toLowerCase();
      if (!tag) return;

      // Contador de aparición
      tagStats[tag] = (tagStats[tag] || 0) + 1;

      // Ejemplos (máximo 3 por etiqueta)
      if (!tagSamples[tag]) tagSamples[tag] = [];

      if (tagSamples[tag].length < 3) {
        const text = $(el).text().trim().slice(0, 100);
        const attrs = Object.fromEntries(Object.entries(el.attribs || {}));
        tagSamples[tag].push({ text, attrs });
      }
    });

    res.json({
      tagSummary: tagStats,
      tagExamples: tagSamples,
    });
  } catch (err) {
    console.error("[SCRAPE ERROR]", err);
    res
      .status(500)
      .json({ error: "Error al procesar la página", detail: err.message });
  }
});

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  try {
    console.log("Peticion recibida por el Back-end. URL: ", req.query.url);

    const response = await axios.get(url, {
      timeout: 10000, //-- 10 segundos
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const html = response.data;
    console.log("Datos recibidos:", html);
    const $ = cheerio.load(html);

    // 👇 Extraer resumen de etiquetas
    const tagStats = {};
    const tagSamples = {};

    $("*").each((i, el) => {
      const tag = el.tagName?.toLowerCase();
      if (!tag) return;

      // Contador de aparición
      tagStats[tag] = (tagStats[tag] || 0) + 1;

      // Ejemplos (máximo 3 por etiqueta)
      if (!tagSamples[tag]) tagSamples[tag] = [];

      if (tagSamples[tag].length < 3) {
        const text = $(el).text().trim().slice(0, 100);
        const attrs = Object.fromEntries(Object.entries(el.attribs || {}));
        tagSamples[tag].push({ text, attrs });
      }
    });
    console.log("Muestras... ", tagStats, tagSamples);

    const data = [];
    $("a").each((index, element) => {
      data.push({
        text: $(element).text(),
        href: $(element).attr("href"),
      });
    });
    res.json(data);
  } catch (error) {
    console.log("Error accessing the URL");

    // Ver toda la información detallada del error
    if (error.response) {
      // El servidor respondió pero con código de error (4xx o 5xx)
      console.error("Response data:", error.response.data);
      console.error("Status code:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error("No response received:", error.request);
    } else {
      // Otro tipo de error
      console.error("Axios error:", error.message);
    }
    // Para debugging general
    console.error("Config:", error.config);
    res.status(500).json({ message: "Error realizando el scraping" });
  }
});

app.get("/puppe", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    console.log("[BACKEND] Scraping URL con Puppeteer:", url);

    const browser = await puppeteer.launch({
      headless: "new", // en Puppeteer >= 20
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // importante en algunos entornos
    });

    const page = await browser.newPage();

    // Set headers opcionales para simular mejor un navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle0", // espera a que no haya más solicitudes activas (ideal para SPAs)
      timeout: 30000,
    });

    const html = await page.content(); // HTML ya renderizado
    // console.log("Puppeteer, html renderizado: ", html);

    await browser.close();

    // ✅ Cheerio para extraer enlaces
    const $ = cheerio.load(html);
    const links = [];
    const prefix = "/es/BBVA/job";

    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      const li = $(el).attr("li");
      const dt = $(el).attr("dt");
      const dd = $(el).attr("dd");
      if (href && href.startsWith(prefix)) {
        links.push({ text, href, li, dt, dd });
      }
    });

    const tagCount = {};
    $("*").each((i, el) => {
      const tag = el.tagName.toLowerCase();
      if (tagCount[tag]) {
        tagCount[tag]++;
      } else {
        tagCount[tag] = 1;
      }
    });
    console.log(tagCount);

    console.log(`[BACKEND] Se extrajeron ${links.length} enlaces.`);
    res.json(links);
  } catch (error) {
    console.error("[BACKEND] Error al scrapear:", error);
    res
      .status(500)
      .json({ error: "Error al realizar el scraping", detail: error.message });
  }
});
