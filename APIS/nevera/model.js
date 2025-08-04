// Model of resource
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    // AJUSTAR: Define tus campos aquí
    // AJUSTAR: Define tus campos aquí
    // AJUSTAR: Define tus campos aquí
    // AJUSTAR: Define tus campos aquí
    // Ejemplo: name: String,
    //          title: String,
  },
  { timestamps: true }
);

// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// Ejemplo: ['name', 'title']
export const camposPermitidosBuscar = [];

export default mongoose.model('Nevera', resourceSchema);
