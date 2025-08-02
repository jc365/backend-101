// Modelo de routes para implementar las opciones estandar de la API
// Este modulo NO REQUIERE NINGUN CAMBIO. Pero para ponerlo en uso lo tienes
// que importar a <server.js> y montarlo bajo un prefix de ruta como
//>> import apiScrapRoutes from "./scrap/Routes.js";
//>> app.use("/api/scraps", apiScrapRoutes);

import ItemController from "./Controller.js";
import mongoose from "mongoose";
import express from "express";
const router = express.Router();

// Definicion del MiddleWare que valida el formato del ID
const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "error",
      data: null,
      message: "ID inválido",
    });
  }
  next();
};

//====================== R U T A S ==================================
// Primero las rutas con dos parámetros dinámicos y sin MW
router.get("/:campo/:valor", ItemController.buscarPorCampo);

// Luego las rutas con :id junto con MW para validar el formato del ID
router.get("/:id", validateObjectId, ItemController.obtenerItem);
router.put("/:id", validateObjectId, ItemController.actualizarItem);
router.patch("/:id", validateObjectId, ItemController.actualizarParcialItem);
router.delete("/:id", validateObjectId, ItemController.borrarItem);

// Finalmente rutas sin parametros y sin MW
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
