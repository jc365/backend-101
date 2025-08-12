import ItemController from "./controller.js";
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
// Orden-1: rutas con nombre fijo (sin MW)
router.post("/run-two-phase/:alias", ItemController.runTwoPhases);

// Orden-2: rutas con dos parámetros dinámicos (sin MW)
router.get("/:campo/:valor", ItemController.buscarPorCampo);

// Orden-3: rutas con :id (con MW que valida formato del ID)
router.get("/:id", validateObjectId, ItemController.obtenerItem);
router.put("/:id", validateObjectId, ItemController.actualizarItem);
router.patch("/:id", validateObjectId, ItemController.actualizarParcialItem);
router.delete("/:id", validateObjectId, ItemController.borrarItem);

// Orden-4: rutas sin parametros (sin MW)
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
