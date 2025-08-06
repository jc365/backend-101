import Item, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";

const baseController = crudApiFactory(Item, camposPermitidosBuscar);

async function searchNote(req, res) {
  debugger;
  const q = req.query.q || "";
  const terms = q.trim().split(/\s+/).filter(Boolean); //-- split for every word
  const fields = ["title", "content"]; //-- search fields
  let filter = commonUtils.buildFilter(terms, fields); //-- make filter for mongo

  // Ejemplo FUTURO: añadir filtro por usuario si está logueado o en la query
  // if (req.user)  filter = { ...filter, user: req.user._id };

  await baseController.listarItems(req, res, filter);
}

async function uploadItem(req, res) {
  const { filename, content } = req.body;
  if (!content) {
    return res
      .status(400)
      .json({ status: "error", message: "Content not exist" });
  }

  const title = getTitle(content);
  if (!title) {
    return res
      .status(400)
      .json({ status: "error", message: "Title not found" });
  }

  const tags = getTags(content);

  const dataItem = {
    filename,
    title,
    content,
    tags,
    createdAt: new Date(),
  };

  try {
    const resultado = await Item.findOneAndUpdate(
      { title }, // filtro discriminante (upsert)
      { $set: dataItem },
      { upsert: true, new: true, includeResultMetadata: true }
    );

    if (resultado.lastErrorObject.updatedExisting) {
      // Update
      return res.status(200).json({
        status: "success",
        operacion: "update",
        data: resultado,
      });
    } else {
      // Create
      return res.status(201).json({
        status: "success",
        operacion: "insert",
        data: resultado,
      });
    }
  } catch (err) {
    console.error("Error uploading note:", err);
    return res.status(500).json({
      status: "error",
      message: "Error uploading note",
    });
  }
}

function getTitle(content) {
  const titleMatch = content.match(/^#{1,6}\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

function getTags(content, sep = " ") {
  const tagLineMatch = content.match(/^\s*tags:\s*(.*)$/im);
  if (tagLineMatch && tagLineMatch[1]) {
    return tagLineMatch[1]
      .split(sep)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export default {
  ...baseController,
  uploadItem,
  searchNote,
};
