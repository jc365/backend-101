import express from "express";
import mongoose from "mongoose";
import dotenv, { config } from "dotenv";
import cors from "cors";
import registerAutomaticRoutes from "./APIS/_nucleo/registerAutomaticRoutes.js";
import { ROOT_DIR, pathJoin } from "./APIS/_nucleo/toolPaths.mjs";
//-- Static routes
import scrapRoutes from "./routes/scrapRoutes.js";
import reboundRoutes from "./routes/reboundRoutes.js";
import staticPagesRoutes from "./routes/staticPagesRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || "production";
const MONGO_URI = process.env.MONGODB_URI;
const BACKEND_URL =
  NODE_ENV == "local"
    ? `http://localhost:${PORT}`
    : "https://backend-101-hu0a.onrender.com";

const CONTEXT = {
  PORT,
  NODE_ENV,
  BACKEND_URL,
};
console.log("\nExecution context:", CONTEXT);

const app = express();
app.use(cors());
app.use(express.json());

// Conection with MongoDB-Atlas
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🔵 Succesfully conect to MongoDB Atlas"))
  .catch((error) => console.error("Error conecting to MongoDB:", error));

//========  R U T A S  ==========
//-- Root route - Ready message with identification
app.get("/", (req, res) => res.send("Server ready (id:sntmr101chrzdhi83jld)"));

//-- Mount static routes (depending on import's)
app.use("/scrap", scrapRoutes); //--usada desde el front de app-jobs
app.use("/rebound", reboundRoutes);
app.use("/static", staticPagesRoutes);

//-- Mount dynamic routes (depending on directories structure)
await registerAutomaticRoutes(app, pathJoin(ROOT_DIR, "APIS"));

// Middleware for routes not found
app.use((req, res) => res.status(404).send(`Cannot GET ${req.originalUrl}`));

app.listen(PORT, () => console.log(`🔵 Server listening at ${BACKEND_URL}`));

export default app;
