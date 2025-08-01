// Plantilla de Model para implementar las opciones estandar de la API
// Este el el modulo que necesita ajustarse exactamente a cada caso:
// 1. Estructura del registro (dentro del modelSchema, al que hay que
//    dejar con ese nombre) 
// 2. Cambiar el nombre del objeto (que implica que mongo mapee con su 
//    coleccion). Son 3 sitios donde cambiar, todos en las 2 ultimas lineas.
import mongoose from "mongoose";
const { Schema } = mongoose;

const modelSchema = new mongoose.Schema({
  alias: String,
  misc1: Schema.Types.Mixed,
  create_date: { type: Date, default: Date.now },
});

const Scrap = mongoose.model("Scrap", modelSchema);
export default Scrap;
