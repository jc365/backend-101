const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err);
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send("Servidor Express (backend) funcionando");
});


app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  try {
    console.log('entro por server');
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const data = [];
    $("a").each((index, element) => {
      data.push({
        text: $(element).text(),
        href: $(element).attr("href"),
      });
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error accessing the URL" });
  }
});
