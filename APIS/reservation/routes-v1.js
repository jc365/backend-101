import controller from "./controller.js"; // ← Import default (tu export)
import express from "express";
import { tenantMiddleware } from "../_nucleo/middleware/security.js";  
import { validateObjectIdMW } from "../_nucleo/common-utils.js"; // Template

const router = express.Router();

// Middleware global
router.use(tenantMiddleware);

// CUSTOM RESERVAS
router.get("/availability", controller.getAvailability);
router.post('/book', tenantMiddleware, controller.bookAppointment);

// Template rutas (ItemController → controller)
router.get("/campo/:valor", controller.buscarPorCampo); // Custom si tienes
router.get("/:id", validateObjectIdMW, controller.obtenerItem);
router.put("/:id", validateObjectIdMW, controller.actualizarItem);
router.patch("/:id", validateObjectIdMW, controller.actualizarParcialItem);
router.delete("/:id", validateObjectIdMW, controller.borrarItem);

// CRUD raíz
router.get("/", controller.listarItems);
router.post("/", controller.crearItem);

export default router;
