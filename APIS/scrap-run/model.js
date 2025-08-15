// Model of ScrapRun
// Ejemplo:
// {
//   "_id": "ObjectId",
//   "alias": "bbva_job_list",
//   "runStartedAt": "2025-08-12T17:00:00Z",
//   "runEndedAt": "2025-08-12T17:10:00Z",
//   "newItemsCount": 5,
//   "removedItemsCount": 0,
//   "log": ["Ejecución correcta", "5 nuevos ítems"]
// }

import mongoose from "mongoose";

const scrapRunSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true, index: true },
    runStartedAt: { type: Date, default: Date.now },
    runEndedAt: { type: Date },
    newItemsCount: { type: Number, default: 0 },
    removedItemsCount: { type: Number, default: 0 },
    log: [{ type: String }],
  },
  { timestamps: false }
);

export const camposPermitidosBuscar = ["alias"];

export default mongoose.model("ScrapRun", scrapRunSchema);