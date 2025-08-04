// Controller of resource
import Item, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import paginate from "../_nucleo/paginate.js";

const baseController = crudApiFactory(Item, camposPermitidosBuscar);

async function searchItem(req, res) {
  debugger;
  // console.log("search-recibido (req completa):", req);
  console.log("search-recibido (req.query):", req.query);
  const queryParams = { ...req.query };
  console.log("search-recibido queryParams:", queryParams);

  try {
    const q = req.query.q || "";
    console.log("parm req q:", q);
    const terms = q.trim().split(/\s+/).filter(Boolean);

    const filter = terms.length
      ? {
          $and: terms.map((t) => ({
            $or: [
              { content: { $regex: t, $options: "i" } },
              { title: { $regex: t, $options: "i" } },
            ],
          })),
        }
      : {};
    console.log("search-montado filter:", filter);

    const baseUrl = req.baseUrl + req.path;

    const resultado = await paginate(Item, req, baseUrl, filter);

    return commonUtils.sendSuccess(
      res,
      resultado.data,
      "Búsqueda realizada con éxito",
      200,
      resultado.pagination,
      resultado.links
    );
  } catch (error) {
    return commonUtils.sendError(res, error.message, 400);
  }
}

// Endpoint 1: Búsqueda avanzada paginada por texto en título y contenido
async function searchItemMIX(req, res) {
  let { q = "", page = 1, pageSize = 10 } = req.query;
  // Construimos filtro con búsqueda AND para cada término en título o contenido
  const terms = q.trim().split(/\s+/).filter(Boolean);
  const filter = terms.length
    ? {
        $and: terms.map((t) => ({
          $or: [
            { content: { $regex: t, $options: "i" } },
            { title: { $regex: t, $options: "i" } },
          ],
        })),
      }
    : {};

  const baseUrl = req.baseUrl + req.path;
  const resultado = await paginate(Item, req, baseUrl, filter);

  // try {
  //   const total = await Item.countDocuments(filter);
  //   const items = await Item.find(filter, { title: 1 }) // solo títulos e _id
  //     .skip((page - 1) * pageSize)
  //     // .limit(pageSize)
  //     .exec();
  //   return sendSuccess(res, items, "mensaje loco", 509);
  //   res.json({ items, total, pageSize });
  // } catch (err) {
  //   console.error("Error en búsqueda:", err);
  //   res.status(500).json({ error: "Error en búsqueda" });
  // }
}

async function searchItemOLD(req, res) {
  let { q = "", page = 1, pageSize = 10 } = req.query;
  page = parseInt(page, 10) || 1;
  pageSize = parseInt(pageSize, 10);

  if (isNaN(pageSize) || pageSize < 1) pageSize = MAX_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  // Construimos filtro con búsqueda AND para cada término en título o contenido
  const terms = q.trim().split(/\s+/).filter(Boolean);
  const filter = terms.length
    ? {
        $and: terms.map((t) => ({
          $or: [
            { content: { $regex: t, $options: "i" } },
            { title: { $regex: t, $options: "i" } },
          ],
        })),
      }
    : {};

  try {
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter, { title: 1 }) // solo títulos e _id
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.json({ items, total, pageSize });
  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error en búsqueda" });
  }
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
  searchItem,
};
