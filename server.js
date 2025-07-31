import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import scrapRoutes from "./routes/scrapRoutes.js";
import reboundRoutes from "./routes/reboundRoutes.js";
import staticPagesRoutes from "./routes/staticPagesRoutes.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5050;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Conection with MongoDB-Atlas
mongoose
  .connect(mongoUri)
  .then(() => console.log("Succesfully conect to MongoDB Atlas"))
  .catch((error) => console.error("Error conecting to MongoDB:", error));

app.get("/", (req, res) => {
  res.send("Server ready (id:sntmr101chrzdhi83xyk4u3se4jckldfjl)");
});

// Work's routes imported
app.use("/scrap", scrapRoutes);
app.use("/rebound", reboundRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/static", staticPagesRoutes);

// Middleware for routes not found
app.use((req, res) => {
  res.status(404).send(`Cannot GET ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

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
