// Modelo de controller para implementar las opciones estandar de la API
// Importante: solo requiere AJUSTAR las lineas que lo indiquen.
// Observa que importa el modelo como Item, como objeto abstracto que
// permite no tener que cambiar nada en las funciones de tratamiento
// aunque esta especializado para el elemento que persiste.
import Item from "./Model.js";

// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo (solo permite los indicados)
// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo (solo permite los indicados)
// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo (solo permite los indicados)
const camposPermitidosBuscar = ["alias"]; //-- ["name", "categoria", "codigo"];

// Helper para respuestas estándar
const sendSuccess = (res, data, message = null, code = 200) => {
  return res.status(code).json({
    status: "success",
    data,
    message,
  });
};

// Helper para respuestas con error
const sendError = (res, message = "Error", code = 500, data = null) => {
  return res.status(code).json({
    status: "error",
    data,
    message,
  });
};

// Sanitizador para evitar inyección en el valor de búsqueda 
const sanitizeValor = (input) => {
  if (typeof input !== "string") return input;
  if (input.includes("$") || input.includes(".")) {
    return null;
  }
  return input;
};

const listarItems = async (req, res) => {
  try {
    const items = await Item.find();
    return sendSuccess(res, items);
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al obtener items");
  }
};

const crearItem = async (req, res) => {
  try {
    const nuevoItem = await Item.create(req.body);
    return sendSuccess(res, nuevoItem, "Item creado correctamente", 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al crear item", 400);
  }
};

const obtenerItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, "No se encontró el Item solicitado", 404);
    }
    return sendSuccess(res, item);
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al buscar item");
  }
};

const actualizarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return sendError(res, "No se encontró el Item a actualizar", 404);
    }
    return sendSuccess(res, item, "Item actualizado correctamente");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al actualizar item", 400);
  }
};

// Igual que actualizar, pero para PATCH
const actualizarParcialItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return sendError(res, "No se encontró el Item a actualizar", 404);
    }
    return sendSuccess(res, item, "Item actualizado correctamente");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al actualizar item", 400);
  }
};

const borrarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return sendError(res, "No se encontró el Item a borrar", 404);
    }
    // 204 = No Content, sin body
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return sendError(res, "Error al borrar item");
  }
};

const buscarPorCampo = async (req, res) => {
  const { campo, valor } = req.params;

  if (!camposPermitidosBuscar.includes(campo)) {
    return sendError(res, `Búsqueda por campo '${campo}' no permitida`, 400);
  }

  const valorSanitizado = sanitizeValor(valor);
  if (valorSanitizado === null) {
    return sendError(
      res,
      "Valor para búsqueda contiene caracteres no permitidos",
      400
    );
  }

  try {
    const filtro = { [campo]: valorSanitizado };
    const item = await Item.findOne(filtro);
    if (!item) {
      return sendError(res, "No se encontró el Item solicitado", 404);
    }
    return sendSuccess(res, item);
  } catch (err) {
    console.error(err);
    return sendError(res, `Error al buscar item por ${campo}`);
  }
};

// AJUSTAR SOLO si pones/quitas funciones (const Controller y el export final)
// AJUSTAR SOLO si pones/quitas funciones (const Controller y el export final)
// AJUSTAR SOLO si pones/quitas funciones (const Controller y el export final)
const Controller = {
  listarItems,
  crearItem,
  obtenerItem,
  actualizarItem,
  actualizarParcialItem,
  borrarItem,
  buscarPorCampo,
};

export default Controller; //-- junto al const anterior permite exportar todas

// O, si quieres, importar solo las que necesites:
export {
  listarItems,
  crearItem,
  obtenerItem,
  actualizarItem,
  actualizarParcialItem,
  borrarItem,
  buscarPorCampo,
};
