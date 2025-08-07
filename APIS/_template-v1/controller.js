import Item, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";

const baseController = crudApiFactory(Item, camposPermitidosBuscar);

// Example of our own method outside the factory: search powerfull about especific fields's resource
// It is necessary to add it to the export default along with baseController
// Also needs...... import paginate from "../_nucleo/paginate.js";
//
// async function specialMethod(req, res) {
//   try {
//     const q = req.query.q || ""; //-- q = 'hello world'
//     const terms = q.trim().split(/\s+/).filter(Boolean); //-- split for every word
//     const fields = ["title", "name"]; //-- search fields
//     let filter = commonUtils.buildFilter(terms, fields); //-- make filter for mongo
//     //-- filter has a query Mongo for search 'hello' or 'world' in 'title' or 'name'
//     const baseUrl = req.baseUrl + req.path;
//     const resultado = await paginate(Item, req, baseUrl, filter);
//     return commonUtils.sendSuccess(
//       res,
//       resultado.data,
//       "Listado obtenido correctamente",
//       200,
//       resultado.pagination,
//       resultado.links
//     );
//   } catch (err) {
//     return commonUtils.sendError(res, err.message, 400);
//   }
// }

export default {
  ...baseController,
};
