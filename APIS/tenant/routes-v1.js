import ItemController from "./controller.js";
import { validateObjectIdMW } from "../_nucleo/common-utils.js";
import express from "express";
import Tenant from "./model.js";
import { humanToRRule } from "../_nucleo/rruleFactory.js";

import {
  tenantMiddleware,
  tenantAuth,
} from "../_nucleo/middleware/security.js";
// import { generateGeneralSchedule } from "../../utils/reservas/scheduleUtils.js";

const router = express.Router();
router.use(tenantMiddleware);

// RUTAS
router.post("/login", ItemController.tenantLogin);

// 🔥 NUEVAS RUTAS /me (JWT scoped)
router.get("/me", tenantMiddleware, ItemController.getMyTenant);
router.put(
  "/me/general-week",
  tenantMiddleware,
  ItemController.updateMyGeneralWeek
);

// Legacy (mantén por ahora)
router.put(
  "/:id/general-week",
  tenantMiddleware,
  ItemController.updateGeneralWeek
);
router.put(
  "/:id/general-schedule",
  tenantMiddleware,
  ItemController.updateGeneralSchedule
);

router.get("/:id", tenantMiddleware, async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  res.json({
    status: "success",
    data: tenant,
  });
});

// CRUD raíz PROTEGIDO
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
