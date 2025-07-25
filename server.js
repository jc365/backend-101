import express from "express";
import cors from "cors";
import puppe from "./routes/puppe.js";
import scrape from "./routes/scrape.js";
import process from "./routes/process.js";

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`[SERVER] Listening at http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Express server ready (id:ssndhi83434jckldfkdfjl)");
});
// Work's routes imported
app.use(scrape, puppe, process);


//----- Ejemplos de funciones para la extraccion de las partes de una URL ------------
// const urlString = "https://www.example.com:8080/path/page.html?search=js&lang=en#section1";
// const url = new URL(urlString);
// console.log("href:", url.href);           // URL completa
// console.log("protocol:", url.protocol);   // "https:"
// console.log("host:", url.host);           // "www.example.com:8080"
// console.log("hostname:", url.hostname);   // "www.example.com"
// console.log("port:", url.port);           // "8080"
// console.log("pathname:", url.pathname);   // "/path/page.html"
// console.log("search:", url.search);       // "?search=js&lang=en"
// console.log("hash:", url.hash);           // "#section1"
// console.log("origin:", url.origin);       // "https://www.example.com:8080"
