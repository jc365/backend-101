// itemController.js
const Item = require('./itemModel'); // Suponiendo un modelo Mongoose o similar


// Resumen:
// Rutinas CRUD tradicionales (GET, POST, PUT/PATCH, DELETE) sobre rutas
// .../api/items y .../api/items/:id.
// Codificación uniforme en HTTP (200, 201, 204, 400, 404, 500 según el caso).
// El cuerpo de la respuesta usa JSON con campos status, data y message


exports.listarItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({
      status: 'success',
      data: items,
      message: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error al obtener items'
    });
  }
};

exports.crearItem = async (req, res) => {
  try {
    const nuevoItem = await Item.create(req.body);
    res.status(201).json({
      status: 'success',
      data: nuevoItem,
      message: 'Item creado correctamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: 'Error al crear item'
    });
  }
};

exports.obtenerItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'No se encontró el Item solicitado'
      });
    }
    res.status(200).json({
      status: 'success',
      data: item,
      message: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error al buscar item'
    });
  }
};

exports.actualizarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'No se encontró el Item a actualizar'
      });
    }
    res.status(200).json({
      status: 'success',
      data: item,
      message: 'Item actualizado correctamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: 'Error al actualizar item'
    });
  }
};

// Para update parcial (patch)
exports.actualizarParcialItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'No se encontró el Item a actualizar'
      });
    }
    res.status(200).json({
      status: 'success',
      data: item,
      message: 'Item actualizado correctamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: 'Error al actualizar item'
    });
  }
};

exports.borrarItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'No se encontró el Item a borrar'
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error al borrar item'
    });
  }
};
