import ItemController from "./controller.js";
import Employee from "./model.js";
import { validateObjectIdMW } from "../_nucleo/common-utils.js";
import express from "express";
import { tenantMiddleware } from "../_nucleo/middleware/tenantContextMiddleware.js";  

const router = express.Router();
router.use(tenantMiddleware);

//====================== R U T A S ==================================
// Orden-1: rutas con nombre fijo (sin MW)

// Orden-2: rutas con dos parámetros dinámicos (sin MW)
router.get("/:campo/:valor", ItemController.buscarPorCampo);
router.put("/bulk", tenantMiddleware, ItemController.bulkUpdateEmployees);

// Orden-3: rutas con :id (con MW que valida formato del ID)
router.put("/:id/schedule", tenantMiddleware, async (req, res) => {
  debugger
  const { scheduleRRule } = req.body;
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { scheduleRRule },
    { new: true }
  );
  res.json({ success: true, employee });
});

router.get("/:id", validateObjectIdMW, ItemController.obtenerItem);
router.put("/:id", validateObjectIdMW, ItemController.actualizarItem);
router.patch("/:id", validateObjectIdMW, ItemController.actualizarParcialItem);
router.delete("/:id", validateObjectIdMW, ItemController.borrarItem);

// Orden-4: rutas sin parametros (sin MW)
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
