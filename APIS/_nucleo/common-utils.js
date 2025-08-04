// import mongoose from "mongoose";

// /**
//  * Función genérica para paginar documentos en Mongoose.
//  * Soporta paginación por página (default) y por cursor (_id).
//  *
//  * @param {mongoose.Model} Model - Modelo Mongoose para consultar.
//  * @param {object} req - Objeto request de Express con query params.
//  * @param {string} baseUrl - URL base para construir links HATEOAS.
//  * @returns {object} Resultado con datos, paginación y enlaces.
//  */
// export async function paginate(Model, req, baseUrl, baseFilter = {}) {
//   const mode = req.query.mode || DEFAULT_MODE;
//   // console.log("pag-recibido (req completa):", req);
//   console.log("pag-recibido (req.query):", req.query);
//   console.log("pag-recibido baseFilter:", baseFilter);
//   const queryParams = { ...req.query };

//   if (mode === "cursor") {
//     // Paginación por cursor
//     let limit = Math.min(
//       parseInt(req.query.limit, 10) || DEFAULT_ITEMS_PAGE,
//       MAX_LIMIT
//     );
//     if (limit <= 0) limit = DEFAULT_ITEMS_PAGE;

//     const after = req.query.after || null;

//     let cursorFilter = {};
//     if (after) {
//       try {
//         cursorFilter = { _id: { $gt: new mongoose.Types.ObjectId(after) } };
//       } catch (e) {
//         throw new Error('Parámetro "after" no es un ObjectId válido');
//       }
//     }

//     // Combinamos filtro base y filtro cursor d
//     let combinedFilter = {};
// console.log('baseFilter:', baseFilter);
//     // Si ambos filtros tienen contenido, combínalos con $and
//     if (Object.keys(baseFilter).length > 0 && Object.keys(cursorFilter).length > 0) {
//       combinedFilter = { $and: [baseFilter, cursorFilter] };
//     } else if (Object.keys(baseFilter).length > 0) {
//       combinedFilter = baseFilter;
//     } else if (Object.keys(cursorFilter).length > 0) {
//       combinedFilter = cursorFilter;
//     } else {
//       combinedFilter = {};
//     }
    
//     // Solicitamos un item extra para saber si hay más
//     const items = await Model.find(combinedFilter)
//       .sort({ _id: 1 })
//       .limit(limit + 1)
//       .exec();

//     const hasMore = items.length > limit;
//     const results = hasMore ? items.slice(0, limit) : items;
//     const nextCursor = hasMore
//       ? results[results.length - 1]._id.toString()
//       : null;

//     // Construcción enlaces HATEOAS
//     const links = {
//       self: buildUrl(baseUrl, queryParams),
//       first: buildUrl(baseUrl, { ...queryParams, after: null }),
//       next: hasMore
//         ? buildUrl(baseUrl, { ...queryParams, after: nextCursor })
//         : null,
//       prev: null, // Retroceso complejo, no implementado aquí
//       last: null,
//     };

//     return {
//       data: results,
//       pagination: {
//         mode: "cursor",
//         limit,
//         next_cursor: nextCursor,
//         has_more: hasMore,
//       },
//       links,
//     };
//   } else {
//     // Paginación por página
//     let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//     let pageSize = Math.min(
//       parseInt(req.query.page_size, 10) || DEFAULT_ITEMS_PAGE,
//       MAX_PAGE_SIZE
//     );
//     if (pageSize <= 0) pageSize = DEFAULT_ITEMS_PAGE;

//     const total = await Model.countDocuments().exec();
//     const totalPages = Math.ceil(total / pageSize);
//     if (page > totalPages && totalPages > 0) page = totalPages;

//     const skip = (page - 1) * pageSize;
//     const items = await Model.find()
//       .sort({ _id: 1 })
//       .skip(skip)
//       .limit(pageSize)
//       .exec();

//     const hasMore = page < totalPages;

//     // Construcción enlaces HATEOAS
//     const links = {
//       self: buildUrl(baseUrl, queryParams),
//       first: buildUrl(baseUrl, { ...queryParams, page: 1 }),
//       last: buildUrl(baseUrl, { ...queryParams, page: totalPages }),
//       prev:
//         page > 1 ? buildUrl(baseUrl, { ...queryParams, page: page - 1 }) : null,
//       next: hasMore
//         ? buildUrl(baseUrl, { ...queryParams, page: page + 1 })
//         : null,
//     };

//     return {
//       data: items,
//       pagination: {
//         mode: "page",
//         page,
//         page_size: pageSize,
//         total,
//         total_pages: totalPages,
//         has_more: hasMore,
//       },
//       links,
//     };
//   }
// }

// Helper para respuestas estándar
export function sendSuccess(
  res,
  data,
  message = null,
  code = 200,
  pagination = {},
  links = {}
) {
  return res.status(code).json({
    status: "success",
    pagination,
    links,
    data,
    message,
  });
}

// Helper para respuestas con error
export function sendError(
  res,
  message = "Error",
  error = null,
  code = 500,
  data = null
) {
  if (process.env?.NODE_ENV === "local") {
    if (error) console.error("ERROR:", error);
    if (message) console.error("MESSAGE:", message);
  }
  return res.status(code).json({
    status: "error",
    data,
    message,
  });
}

// Sanitizador para evitar inyección en el valor de búsqueda
export function sanitizeValor(input) {
  if (typeof input !== "string") return input;
  if (input.includes("$") || input.includes(".")) return null;
  return input;
}

