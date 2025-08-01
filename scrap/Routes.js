// Modelo de routes para implementar las opciones estandar de la API
// Este modulo NO REQUIERE NINGUN CAMBIO. Pero para ponerlo en uso lo tienes 
// que importar a <server.js> y montarlo bajo un prefix de ruta como
//>> import apiScrapRoutes from "./scrap/Routes.js";
//>> app.use("/api/scraps", apiScrapRoutes);

import ItemController from './Controller.js'; 
import express from 'express';
const router = express.Router();

// Listar todos los items
router.get('/', ItemController.listarItems);

// Crear un nuevo item
router.post('/', ItemController.crearItem);

// Obtener un item por ID
router.get('/:id', ItemController.obtenerItem);

// Actualizar completamente un item
router.put('/:id', ItemController.actualizarItem);

// Actualizar parcialmente un item
router.patch('/:id', ItemController.actualizarParcialItem);

// Eliminar un item
router.delete('/:id', ItemController.borrarItem);

// Obtener un item por otro campo diferente al ID (limitado el uso de :campo en el Controller)
router.get('/:campo/:valor', ItemController.buscarPorCampo);

export default router;
