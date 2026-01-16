import ItemController from "./controller.js";
import { validateObjectIdMW } from "../_nucleo/common-utils.js";
import express from "express";
import { tenantMiddleware } from "../_nucleo/tenant-middleware.js";

const router = express.Router();
router.use(tenantMiddleware);

// RUTAS PÚBLICAS (SIN middleware)
router.post("/login", ItemController.tenantLogin);
router.get("/:campo/:valor", ItemController.buscarPorCampo);

// Rutas PROTEGIDAS con :id
router.get("/:id", validateObjectIdMW, ItemController.obtenerItem);
router.put("/:id", validateObjectIdMW, ItemController.actualizarItem);
router.patch("/:id", validateObjectIdMW, ItemController.actualizarParcialItem);
router.delete("/:id", validateObjectIdMW, ItemController.borrarItem);

// CRUD raíz PROTEGIDO
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
