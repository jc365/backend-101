import mongoose from "mongoose";

/**
 * Note model. Stores a written note in markdown format
 * - filename:  file from which the note is imported
 * - title:     extracted from the first line of the file
 * - content:   file markdown
 * - tags:      array of strings (empty, default) as facility to seach
 */
const noteSchema = new mongoose.Schema({
  filename: String,
  title: String,
  content: String,
  createdAt: Date,
  tags: { type: [String], default: [] },
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
