// Plantilla de Model para implementar las opciones estandar de la API
// Este el el modulo que necesita ajustarse exactamente a cada caso:
// 1. Estructura del registro dentro del primer bloque del modelSchema 
//    (hay que dejar con ese nombre). El segundo bloque define los timestamp
//    en modo automatico (Mongo se encarga de actualizarlos convenientemente)
// 2. Cambiar el nombre del objeto (que implica que mongo mapee con su
//    coleccion). Son 3 sitios donde cambiar, todos en las 2 ultimas lineas.

/**
 * Note model. Stores a written note in markdown format
 * - filename:  file from which the note is imported
 * - title:     extracted from the first line of the file
 * - content:   file markdown
 * - tags:      array of strings (empty, default) as facility to seach
 */
import mongoose from "mongoose";

//--array con los campos por los que se puede buscar (aparte de ID)
export const camposPermitidosBuscar = ['title']; 

const modelSchema = new mongoose.Schema(
  {
    filename: String,
    title: String,
    content: String,
    tags: { type: [String], default: [] },
    },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
);

const Note = mongoose.model("Note", modelSchema);
export default Note;
