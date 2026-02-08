// _nucleo/middleware/tenantContextMiddleware.js
import jwt from "jsonwebtoken";
import Tenant from "../../tenant/model.js";

// import problematico, mientras se soluciona... "isValidTimezone" metida inline
import { isValidTimezone } from "../../../utils/reservas/timezoneUtils.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const isConsole = process.env.SW_CONSOLE === "true";
const isDev = process.env.NODE_ENV === "local";
const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const tenantContextMiddleware = async (req, res, next) => {
  try {
    // ========== BYPASS ==========
    if (shouldBypass(req)) {
      if (isConsole) console.log(`  ✅ Bypass for ${req.path}`);
      return next();
    }

    // ========== OBTENER TENANT ID ==========
    const { tenantId, source } = extractTenantId(req);

    if (!tenantId) {
      return res.status(401).json({
        error: "Tenant identification required",
        hints: ["Include Authorization: Bearer <token>", "Use valid subdomain"],
      });
    }

    // ========== OBTENER TENANT COMPLETO ==========
    let tenantContext = await getOrFetchTenantContext(tenantId, source);

    if (!tenantContext) {
      return res.status(404).json({ error: "Tenant not found", tenantId });
    }

    // ========== INYECTAR Y CONTINUAR ==========
    req.tenantContext = tenantContext;
    req.tenantId = tenantContext.id; // Para compatibilidad

    if (req.body && req.method === "POST" && !req.body.tenantId) {
      req.body.tenantId = tenantContext.id;
    }

    if (isConsole) {
      console.log(`✅ Tenant context: ${tenantContext.name} (${tenantContext.timezone})`);
      console.log(`   📅 Schedules: ${tenantContext.schedule.regular.length} regular`);
      console.log(`   🎄 Holidays: ${tenantContext.schedule.exceptions.length} holidays`);
    }

    next();
  } catch (error) {
    handleMiddlewareError(error, res, isDev);
  }
};

// ========== FUNCIONES AUXILIARES ==========

function shouldBypass(req) {
  return (
    req.path === "/login" || (isDev && req.method === "POST" && req.baseUrl?.includes("tenants"))
  );
}

function extractTenantId(req) {
  let tenantId = null;
  let source = null;

  // 1. De JWT
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      tenantId = decoded.tenantId;
      source = "jwt";
    } catch (jwtError) {
      // Token inválido, continuamos
    }
  }

  // 2. De subdomain
  if (!tenantId) {
    const host = req.get("host");
    const subdomain = host?.split(".")[0];
    if (subdomain && !["www", "tu-dominio", "localhost"].includes(subdomain)) {
      tenantId = subdomain;
      source = "subdomain";
    }
  }

  // 3. Admin bypass (dev)
  if (!tenantId && req.query.admin === "true") {
    tenantId = req.query.tenantId;
    source = "admin_override";
  }

  return { tenantId, source };
}

async function getOrFetchTenantContext(tenantId, source) {
  const cacheKey = `tenant:${tenantId}`;

  // Cache
  if (tenantCache.has(cacheKey)) {
    const cached = tenantCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return { ...cached.data, cached: true, source };
    }
    tenantCache.delete(cacheKey);
  }

  // DB Query (SIN populate, son embebidos)
  const query =
    source === "subdomain"
      ? { $or: [{ subdomain: tenantId }, { name: tenantId }] }
      : { $or: [{ _id: tenantId }, { subdomain: tenantId }, { name: tenantId }] };

  const tenant = await Tenant.findOne(query).lean();

  if (!tenant) return null;

  // Procesar
  const timezone = isValidTimezone(tenant.timezone) ? tenant.timezone : "UTC";

  const tenantContext = {
    // Identificación
    id: tenant._id.toString(),
    name: tenant.name,
    subdomain: tenant.subdomain,

    // Ubicación y tiempo
    timezone,
    locale: tenant.locale || "es-ES",

    // Horarios (usando tus campos exactos)
    schedule: processTenantSchedule(tenant.general_schedule, tenant.general_holidays, timezone),
    businessHours: tenant.businessHours || { open: "09:00", close: "17:00" },
    slotDuration: tenant.minutes_slot || 15, // ← Usando TU campo
    maxCapacity: tenant.maxCapacity || 50,

    // Configuración específica de TU modelo
    acceptAppointmentCustom: tenant.accept_appointment_custom !== false,
    address: tenant.address,
    phone: tenant.phone,
    email: tenant.email,

    // Metadata
    isActive: true, // Por defecto
    createdAt: tenant.createdAt,

    // Tracking
    source,
    cached: false,
  };

  // Guardar en cache
  tenantCache.set(cacheKey, {
    data: tenantContext,
    timestamp: Date.now(),
  });

  return tenantContext;
}

function processTenantSchedule(schedules = [], holidays = [], timezone) {
  // Regular schedules
  const regular = schedules.map((s, index) => ({
    id: `schedule_${index}`,
    type: "regular",
    rrule: s.rrule,
    description: s.label || `Horario: ${s.days?.join(",")} ${s.start}-${s.end}`,
    days: s.days || [],
    startTime: s.start,
    endTime: s.end,
    breaks: s.breaks || [],
    metadata: {
      isGeneral: true,
      label: s.label,
      daysCount: s.days?.length || 0,
    },
  }));

  // Holidays como excepciones
  const exceptions = holidays.map((h, index) => ({
    id: `holiday_${index}`,
    type: h.recurring ? "holiday_recurring" : "holiday_single",
    rrule: h.rrule || `DTSTART:${h.date}T000000Z\nRRULE:FREQ=DAILY;COUNT=1`,
    reason: h.label,
    date: h.date,
    recurring: h.recurring || false,
    metadata: {
      isHoliday: true,
      date: h.date,
    },
  }));

  return {
    regular: regular.length ? regular : [generateDefaultSchedule(timezone)],
    exceptions,
    vacations: [], // Vacations aparte (futuro)
  };
}

function generateDefaultSchedule(timezone) {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: "default",
    type: "regular",
    rrule: `DTSTART:${today}T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9,10,11,12,13,14,15,16`,
    description: "Horario laboral estándar (L-V 9-17)",
    days: ["MO", "TU", "WE", "TH", "FR"],
    startTime: "09:00",
    endTime: "17:00",
    breaks: [],
    metadata: {
      isDefault: true,
      generatedAt: new Date().toISOString(),
    },
  };
}

function handleMiddlewareError(error, res, isDev) {
  console.error("❌ Tenant context middleware error:", error);

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(500).json({
    error: "Internal server error",
    message: isDev ? error.message : undefined,
    stack: isDev ? error.stack : undefined,
  });
}

// Para compatibilidad
export const tenantMiddleware = tenantContextMiddleware;
export const clearTenantCache = (tenantId = null) => {
  if (tenantId) {
    tenantCache.delete(`tenant:${tenantId}`);
  } else {
    tenantCache.clear();
  }
};
