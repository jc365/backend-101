// Modelo de factoria que exporta los metodos que soportan
// la funcionalidad basica de una API
// Observa que importa el modelo como Item, como objeto abstracto que
// permite no tener que cambiar nada en las funciones de tratamiento
// aunque esta especializado para el elemento al que da funcionalidad.
import {
  sendSuccess,
  sendError,
  sanitizeValor,
} from "./common-utils.js";
import paginate from "./paginate.js";

const crudApiFactory = (Item, camposPermitidosBuscar = []) => {
  const listarItems = async (req, res) => {
    try {
      const baseUrl = req.baseUrl + req.path;
      const resultado = await paginate(Item, req, baseUrl);
      return sendSuccess(
        res,
        resultado.data,
        "Listado obtenido correctamente",
        200,
        resultado.pagination,
        resultado.links
      );
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  };

  const crearItem = async (req, res) => {
    try {
      const nuevoItem = await Item.create(req.body);
      return sendSuccess(res, nuevoItem, "Item creado correctamente", 201);
    } catch (err) {
      return sendError(res, "Error al crear item", err, 400);
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
      return sendError(res, "Error al buscar item", err);
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
      return sendError(res, "Error al actualizar item", err, 400);
    }
  };

  // Igual que actualizar, pero para PATCH
  const actualizarParcialItem = async (req, res) => {
    try {
      const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!item) {
        return sendError(res, "No se encontró el Item a actualizar", null, 404);
      }
      return sendSuccess(res, item, "Item actualizado correctamente");
    } catch (err) {
      return sendError(res, "Error al actualizar item", err, 400);
    }
  };

  const borrarItem = async (req, res) => {
    try {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (!item) {
        return sendError(res, "No se encontró el Item a borrar", null, 404);
      }
      // According to the purist view of REST, status should be 204 without JSON.
      // For ease of processing, we send a 200 with standar JSON.
      return sendSuccess(res, null, "Item borrado correctamente");
    } catch (err) {
      return sendError(res, "Error al borrar item", err);
    }
  };

  const buscarPorCampo = async (req, res) => {
    const { campo, valor } = req.params;

    if (!camposPermitidosBuscar.includes(campo)) {
      return sendError(
        res,
        `Search by field '${campo}' not available`,
        null,
        400
      );
    }

    const valorSanitizado = sanitizeValor(valor);
    if (valorSanitizado === null) {
      return sendError(
        res,
        "Valor para búsqueda contiene caracteres no permitidos",
        null,
        400
      );
    }

    try {
      const filtro = { [campo]: valorSanitizado };
      const item = await Item.findOne(filtro);
      if (!item) {
        return sendError(res, "No se encontró el Item solicitado", null, 404);
      }
      return sendSuccess(res, item);
    } catch (err) {
      return sendError(res, `Error al buscar item por ${campo}`, err);
    }
  };

  return {
    listarItems,
    crearItem,
    obtenerItem,
    actualizarItem,
    actualizarParcialItem,
    borrarItem,
    buscarPorCampo,
  };
};

export default crudApiFactory; 

