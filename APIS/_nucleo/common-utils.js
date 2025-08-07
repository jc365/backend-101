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
    pagination,
    links,
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

// Sanitizador para evitar inyección en el valor de búsqueda
export function sanitizeValor(input) {
  if (typeof input !== "string") return input;
  if (input.includes("$") || input.includes(".")) return null;
  return input;
}
