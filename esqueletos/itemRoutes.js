const express = require('express');
const router = express.Router();

// Controladores (puedes implementarlos en otro archivo)
const ItemController = require('./itemController');

// Listar todos los items
router.get('/api/items', ItemController.listarItems);

// Crear un nuevo item
router.post('/api/items', ItemController.crearItem);

// Obtener un item por ID
router.get('/api/items/:id', ItemController.obtenerItem);

// Actualizar completamente un item
router.put('/api/items/:id', ItemController.actualizarItem);

// Actualizar parcialmente un item
router.patch('/api/items/:id', ItemController.actualizarParcialItem);

// Eliminar un item
router.delete('/api/items/:id', ItemController.borrarItem);

module.exports = router;
