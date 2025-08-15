// Model of ScrapSource
// Ejemplo
// {
//   "_id": "ObjectId",
//   "alias": "bbva_job_list",
//   "url": "https://bbva.wd3.myworkdayjobs.com/es-ES/Trabaja_con_nosotros",
//   "mode": "prod",
//   "active": true,
//   "source": "https://bbva.wd3.myworkdayjobs.com",
//   "listPipeline": [ ... ],
//   "detailPipeline": [ ... ],
//   "createdAt": "2025-08-12T17:00:00Z",
//   "updatedAt": "2025-08-12T17:00:00Z"
// }

import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true, index: true },
    comment: { type: String },
    url: { type: String, required: true },
    mode: { type: String, enum: ["prod", "test"], default: "test" },
    active: { type: Boolean, default: true },
    source: { type: String }, // prefijo para URLs relativas
    listPipeline: { type: Array, required: true }, // array de steps (JSON)
    detailPipeline: { type: Array, required: true }, // array de steps (JSON)
  },
  { timestamps: true }
);

export const camposPermitidosBuscar = ['alias'];

export default mongoose.model("ScrapSource", resourceSchema);
