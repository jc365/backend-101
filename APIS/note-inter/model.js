// Model of resource
import mongoose from "mongoose";

/**
 * Note model. Stores a written note in markdown format
 * - filename:  file from which the note is imported
 * - title:     extracted from the first line of the file
 * - content:   file markdown
 * - tags:      array of strings (empty, default) as facility to seach
 */
const resourceSchema = new mongoose.Schema(
  {
    filename: String,
    title: String,
    content: String,
    updated_data: Date,
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// AJUSTAR: array con los campos por los que se puede buscar (aparte de ID)
// Ejemplo: ['name', 'title']
export const camposPermitidosBuscar = ['title'];

export default mongoose.model("Note", resourceSchema);
