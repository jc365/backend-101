import Tenant, { camposPermitidosBuscar } from "./model.js";
import Employee from "../employee/model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import * as toolsReservas from "../../utils/reservas/scheduleUtils.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const baseController = crudApiFactory(Tenant, camposPermitidosBuscar);

export const tenantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin/superuser login (hardcode o DB)
    if (email === "admin@mcarthur.com" && password === "123") {
      const tenant = await Tenant.findById("696956f31e25f13a08a35ec8");
      const token = jwt.sign({ tenantId: tenant._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        tenant: {
          id: tenant._id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
      });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Tu updateGeneralWeek actual (legacy con :id) → mantener por ahora
export const updateGeneralWeek = async (req, res) => {
  const { id } = req.params;
  const { general_week, general_breaks = [], general_holidays = [] } = req.body;

  // Validación
  if (!general_week || typeof general_week !== "object") {
    return res.status(400).json({ error: "general_week required" });
  }

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (const day of days) {
    const cfg = general_week[day];
    if (cfg?.enabled && (!cfg.start || !cfg.end || cfg.start >= cfg.end)) {
      return res.status(400).json({
        error: `Invalid schedule for ${day}: start < end required`,
      });
    }
  }

  try {
    // 1. Update tenant
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      {
        general_week,
        general_breaks,
        general_holidays,
      },
      { new: true }
    );

    // 2. Generate schedule from general_week
    const general_schedule = generateGeneralSchedule(general_week);

    // 3. Update employees that follow general schedule
    await Employee.updateMany(
      { tenant_id: id, custom_week: false },
      {
        $set: {
          sw_general_schedule: general_schedule,
          schedule_updated_at: new Date(),
        },
      }
    );

    // 4. Response with computed fields
    res.json({
      id: tenant.id,
      name: tenant.name,
      general_week,
      general_schedule, // computed
      general_breaks,
      general_holidays,
    });
  } catch (error) {
    console.error("Update general week error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGeneralSchedule = async (req, res) => {
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
};

// 🔑 NUEVO: mi tenant actual (JWT)
export const getMyTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId).select("-password");
    res.json({
      status: "success",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ error: "Tenant not found" });
  }
};

// update general_schedule de MI tenant
export const updateMyGeneralWeek = async (req, res) => {
  const { general_week, general_breaks = [], general_holidays = [] } = req.body;
  console.log("entro en updateMyGeneralWeek-1");

  // Validaciones
  if (!general_week || typeof general_week !== "object") {
    return res.status(400).json({ error: "general_week required" });
  }

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (const day of days) {
    const cfg = general_week[day];
    if (cfg?.enabled && (!cfg.start || !cfg.end || cfg.start >= cfg.end)) {
      return res.status(400).json({
        error: `Invalid schedule for ${day}: start < end required`,
      });
    }
  }

  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId, // autofill by MW (token-JWT)
      {
        general_schedule: toolsReservas.generateGeneralSchedule(general_week),
        general_breaks: toolsReservas.generateGeneralBreaks(general_breaks),
        general_holidays: toolsReservas.generateHoliday(general_holidays),
      },
      { new: true }
    );

    const response = {
      id: tenant.id,
      name: tenant.name,
      general_schedule: tenant.general_schedule,
      general_breaks,
      general_holidays,
    };

    console.log("Request-response ... ", response);
    res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("Update my general week error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  ...baseController,
  tenantLogin,
  updateGeneralWeek, // legacy /:id/general-week
  updateGeneralSchedule, // legacy /:id/general-schedule
  getMyTenant, // ✅ nuevo /me
  updateMyGeneralWeek, // ✅ nuevo /me/general-week
};
