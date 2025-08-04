import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import registerAutomaticRoutes from "./registerAutomaticRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import noteRoutes from "./routes/noteRoutes.js";
// import scrapRoutes from "./routes/scrapRoutes.js";
import reboundRoutes from "./routes/reboundRoutes.js";
// import apiScrapRoutes from "./APIS/scrap/Routes.js";
// import apiNoteRoutes from "./APIS/note/Routes.js";
import staticPagesRoutes from "./routes/staticPagesRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGODB_URI;
const DIR_ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIR_FATHER_RESOURCES = path.join(DIR_ROOT, "APIS");

const app = express();
app.use(cors());
app.use(express.json());

// Conection with MongoDB-Atlas
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Succesfully conect to MongoDB Atlas"))
  .catch((error) => console.error("Error conecting to MongoDB:", error));

app.get("/", (req, res) => {
  res.send("Server ready (id:sntmr101chrzdhi83xyk4u3se4jckldfjl)");
});

// Mount static routes (imported)
// app.use("/scrap", scrapRoutes);
app.use("/rebound", reboundRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/notes", apiNoteRoutes);
// app.use("/api/notes", noteRoutes);
// app.use("/api/scraps", apiScrapRoutes);
app.use("/static", staticPagesRoutes);
// Mount dynamic routes
await registerAutomaticRoutes(app, DIR_FATHER_RESOURCES, "/api");

// Middleware for routes not found
app.use((req, res) => {
  res.status(404).send(`Cannot GET ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

export default app;
