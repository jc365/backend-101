// Modelo de controller para implementar las opciones estandar de la API
// Importante: solo requiere AJUSTAR las lineas que lo indiquen
import Item from "./Model.js"; 

// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo
// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo
// AJUSTAR s/caso para limitar la ruta generica buscarPorCampo
const camposPermitidosBuscar = ["alias"]  //, "categoria", "codigo"];

const listarItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({
      status: "success",
      data: items,
      message: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: null,
      message: "Error al obtener items",
    });
  }
};

const crearItem = async (req, res) => {
  try {
    const nuevoItem = await Item.create(req.body);
    res.status(201).json({
      status: "success",
      data: nuevoItem,
      message: "Item creado correctamente",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      data: null,
      message: "Error al crear item",
    });
  }
};

const obtenerItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: "No se encontró el Item solicitado",
      });
    }
    res.status(200).json({
      status: "success",
      data: item,
      message: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: null,
      message: "Error al buscar item",
    });
  }
};

const actualizarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: "No se encontró el Item a actualizar",
      });
    }
    res.status(200).json({
      status: "success",
      data: item,
      message: "Item actualizado correctamente",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      data: null,
      message: "Error al actualizar item",
    });
  }
};

// Para update parcial (patch)
const actualizarParcialItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: "No se encontró el Item a actualizar",
      });
    }
    res.status(200).json({
      status: "success",
      data: item,
      message: "Item actualizado correctamente",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      data: null,
      message: "Error al actualizar item",
    });
  }
};

const borrarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: "No se encontró el Item a borrar",
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: null,
      message: "Error al borrar item",
    });
  }
};

const buscarPorCampo = async (req, res) => {
  const { campo, valor } = req.params;

  // Validar que el campo esté permitido
  if (!camposPermitidosBuscar.includes(campo)) {
    return res.status(400).json({
      status: "error",
      data: null,
      message: `Búsqueda por campo '${campo}' no permitida`,
    });
  }

  try {
    const filtro = {};
    filtro[campo] = valor;
    const item = await Item.findOne(filtro);
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        // message: `No se encontró el Item con ${campo}=${valor}`,
        message: "No se encontró el Item solicitado",
      });
    }
    res.status(200).json({
      status: "success",
      data: item,
      message: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: null,
      message: `Error al buscar item por ${campo}`,
    });
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

export default Controller;  //-- junto al const anterior permite exportar todas

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
