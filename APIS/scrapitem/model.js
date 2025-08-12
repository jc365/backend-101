// Ejemplo:
// {
//   "_id": "ObjectId",
//   "alias": "bbva_job_list",
//   "data": { "title": "...", "summary": { ... } },
//   "sourceUrl": "https://...",
//   "hash": "sha256_...",
//   "read": false,
//   "createdAt": "2025-08-12T17:05:00Z"
// }

// Model of scrapItems
import mongoose from "mongoose";

const scrapItemSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true, index: true },
    data: { type: Object, required: true }, // datos relevantes ya procesados
    sourceUrl: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// índice compuesto para evitar duplicados (alias + hash)
scrapItemSchema.index({ alias: 1, hash: 1 }, { unique: true });

export const camposPermitidosBuscar = ["alias", "hash"];

export default mongoose.model("ScrapItem", scrapItemSchema);
