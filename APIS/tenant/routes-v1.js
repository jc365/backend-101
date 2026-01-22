import ItemController from "./controller.js";
import { validateObjectIdMW } from "../_nucleo/common-utils.js";
import express from "express";
import Tenant from "./model.js";
import { humanToRRule } from "../_nucleo/rruleFactory.js";
import { tenantMiddleware } from "../_nucleo/tenant-middleware.js";

const router = express.Router();
router.use(tenantMiddleware);

// RUTAS
router.post("/login", ItemController.tenantLogin);

// --- solo admite un string
// router.put("/:id/general-schedule", tenantMiddleware, async (req, res) => {
//   try {
//     const { label, days, start, end } = req.body;
//     const rrule = humanToRRule({ days, start, end });

//     const tenant = await Tenant.findById(req.params.id);

//     // 1. BORRA TODOS con este label
//     tenant.general_schedule = tenant.general_schedule.filter(
//       (s) => s.label !== label
//     );

//     // 2. AÑADE nuevo (siempre único)
//     tenant.general_schedule.push({ label, days, start, end, rrule });

//     await tenant.save();

//     res.json({
//       status: "success",
//       data: tenant.general_schedule,
//       message: "Guardado (label único)",
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// routes/tenants.js → REPLACE put('/:id/general-schedule')
// soporta recibir un array
router.put("/:id/general-schedule", tenantMiddleware, async (req, res) => {
  try {
    const schedules = Array.isArray(req.body) ? req.body : [req.body]; // ✅ Array o single

    const tenant = await Tenant.findById(req.params.id);

    // 1. Limpia duplicados
    tenant.general_schedule = cleanDuplicates(tenant.general_schedule);

    // 2. Añade/actualiza nuevos
    for (const input of schedules) {
      const { label, days, start, end } = input;

      // Remove existing
      tenant.general_schedule = tenant.general_schedule.filter(
        (s) => s.label !== label
      );

      // Add new
      tenant.general_schedule.push({
        label,
        days,
        start,
        end,
        rrule: humanToRRule({ days, start, end }),
      });
    }

    await tenant.save();

    res.json({
      status: "success",
      data: tenant.general_schedule,
      message: `${schedules.length} schedules saved`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", tenantMiddleware, async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  res.json({
    status: "success",
    data: tenant,
  });
});

router.get("/:campo/:valor", ItemController.buscarPorCampo);

// Rutas PROTEGIDAS con :id (de momento comentadas ya que son las basicas)
// router.get("/:id", validateObjectIdMW, ItemController.obtenerItem);
// router.put("/:id", validateObjectIdMW, ItemController.actualizarItem);
// router.patch("/:id", validateObjectIdMW, ItemController.actualizarParcialItem);
// router.delete("/:id", validateObjectIdMW, ItemController.borrarItem);

// CRUD raíz PROTEGIDO
router.get("/", ItemController.listarItems);
router.post("/", ItemController.crearItem);

export default router;
