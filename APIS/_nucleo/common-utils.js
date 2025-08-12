import mongoose from "mongoose";

// Funcion para crear la sintaxis de busqueda combinada de varios textos en varios
// campos que necesita una query Mongo
export function buildFilter(terms, fields) {
  if (!terms || terms.length === 0) return {};
  if (!fields || fields.length === 0) return {};

  return {
    $and: terms.map((term) => ({
      $or: fields.map((field) => ({
        [field]: { $regex: term, $options: "i" },
      })),
    })),
  };
}

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
    message,
    _pagination: pagination,
    _links: links,
    data,
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

/** Reemplaza todas las ocurrencias de un texto por otro en un string.
 * Por defecto, respeta los formatos de origen (mayusculas, minusculas, capital inicial) haciendo la sustitucion
 * que corresponda. Pero pasando el parm <sensibleFormatoOrigen> a false, realiza un replace tradicional
 * @param {string} contenido - Texto original (puede ser el contenido completo de un fichero leido previamente)
 * @param {string} buscar - Texto a buscar
 * @param {string} reemplazar - Texto nuevo que sustituirá al buscado
 * @param {boolean} sensibleFormatoOrigen - [True: Reemplazo segun el formato de origen / False: Reemplazo exacto del texto a buscar]
 * @returns {string} Texto con todos los reemplazos aplicados
 */
export function replaceAdvanced(
  contenido,
  buscar,
  reemplazar,
  sensibleFormatoOrigen = true
) {
  const textoEscapado = buscar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (!sensibleFormatoOrigen) {
    const regex = new RegExp(textoEscapado, "g"); // bandera "g" = reemplazo global
    return contenido.replace(regex, reemplazar);
  }

  const regex = new RegExp(textoEscapado, "gi"); // i = insensitive, g = global
  return contenido.replace(regex, (coincidencia) => {
    if (coincidencia === coincidencia.toUpperCase()) {
      // TODO EN MAYÚSCULAS
      return reemplazar.toUpperCase();
    } else if (coincidencia === coincidencia.toLowerCase()) {
      // todo en minúsculas
      return reemplazar.toLowerCase();
    } else if (
      coincidencia[0] === coincidencia[0].toUpperCase() &&
      coincidencia.slice(1) === coincidencia.slice(1).toLowerCase()
    ) {
      // Capital Inicial
      return (
        reemplazar.charAt(0).toUpperCase() + reemplazar.slice(1).toLowerCase()
      );
    } else {
      // Otros casos (mezclas raras de mayúsculas/minúsculas)
      return reemplazar;
    }
  });
}

// Sanitizador para evitar inyección en el valor de búsqueda
export function sanitizeValor(input) {
  if (typeof input !== "string") return input;
  if (input.includes("$") || input.includes(".")) return null;
  return input;
}

/**
 * MiddleWare que valida si el Id pasado como parametro de una ruta cumple
 * con el formato y longitud que utiliza Mongo (antes de hacer la query).
 */
export function validateObjectIdMW(req, res, next) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "error",
      data: null,
      message: "ID inválido",
    });
  }
  next();
}
