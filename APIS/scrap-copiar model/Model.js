// Plantilla de Model para implementar las opciones estandar de la API
// Este el el modulo que necesita ajustarse exactamente a cada caso:
// 1. Estructura del registro dentro del primer bloque del modelSchema 
//    (hay que dejar con ese nombre). El segundo bloque define los timestamp
//    en modo automatico (Mongo se encarga de actualizarlos convenientemente)
// 2. Cambiar el nombre del objeto (que implica que mongo mapee con su
//    coleccion). Son 3 sitios donde cambiar, todos en las 2 ultimas lineas.
import mongoose from "mongoose";
const { Schema } = mongoose;

const modelSchema = new mongoose.Schema(
  {
    alias: String,
    misc1: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
);

const Scrap = mongoose.model("Scrap", modelSchema);
export default Scrap;
