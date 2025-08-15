import ItemController from "./controller.js";
import { validateObjectIdMW } from "../_nucleo/common-utils.js";
import express from "express";
const router = express.Router();

//====================== R U T A S ==================================
// Orden-1: rutas con nombre fijo (sin MW)
router.get("/unread/:alias", ItemController.fxRouteUnread);
router.post("/mark-read", ItemController.fxRouteMarkRead);

// Orden-2: rutas con dos parámetros dinámicos (sin MW)
router.get("/:campo/:valor", ItemController.buscarPorCampo);

// Orden-3: rutas con :id (con MW que valida formato del ID)
router.get("/:id", validateObjectIdMW, ItemController.obtenerItem);
router.put("/:id", validateObjectIdMW, ItemController.actualizarItem);
router.patch("/:id", validateObjectIdMW, ItemController.actualizarParcialItem);
router.delete("/:id", validateObjectIdMW, ItemController.borrarItem);

// Orden-4: rutas sin parametros (sin MW)
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
