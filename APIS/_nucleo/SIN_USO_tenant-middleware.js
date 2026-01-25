import jwt from "jsonwebtoken";
import Tenant from "../tenant/model.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const isConsole = process.env.SW_CONSOLE === "true";
const isDev = process.env.NODE_ENV === "local";

export const tenantMiddleware = async (req, res, next) => {
  try {
    if (isConsole) {
      const now = new Date().toISOString();
      const headers = { ...req.headers };

      // 🚫 Ocultar info irrelevante
      delete headers.cookie;
      delete headers["sec-ch-ua"];
      delete headers["sec-ch-ua-mobile"];
      delete headers["sec-ch-ua-platform"];
      delete headers["accept-encoding"];
      delete headers["accept-language"];

      console.log(
        `\n🔍 ============ ${now} >> ${req.method} ${req.path} ===========`,
        {
          path: req.path,
          baseUrl: req.baseUrl,
          query: JSON.stringify(req.query, null, 2),
          body: req.body ? JSON.stringify(req.body, null, 2) : null,
          headers, 
          host: req.get("host"),
        }
      );
    }

    if (req.path === "/login") {
      if (isConsole) console.log("  ✅ Bypass para /login");
      return next(); //-- ruta que no pasa por el este MW
    }

    // Bypass creación tenants mientras pruebas
    if (isDev && req.method === "POST" && req.baseUrl?.includes("tenants")) {
      if (isConsole) console.log("  ✅ Bypass tenants POST");
      return next();
    }

    // JWT (frontend login)
    const auth = req.headers.authorization;

    if (auth?.startsWith("Bearer ")) {
      console.log("✅ Bearer detectado"); // ← AÑADE
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);

      console.log("🔐 JWT decoded. TenantId:", decoded.tenantId);
      req.tenantId = decoded.tenantId;

      // Fill tenantId in Body (secure)
      if (req.body && req.method === "POST") {
        req.body.tenantId = req.tenantId;
        console.log("🔍 tenantId AUTOFILL:", req.body.tenantId);
      }

      return next();
    }

    // Subdomain (ej: pelu.mcarthur.com)
    const host = req.get("host");
    const subdomain = host?.split(".")[0];
    if (subdomain !== "tu-dominio" && subdomain) {
      const tenant = await Tenant.findOne({ subdomain });
      if (tenant) {
        req.tenantId = tenant._id;
        return next();
      }
    }

    // Admin bypass (dev)
    if (req.query.admin === "true") {
      req.tenantId = req.query.tenantId || null;
      return next();
    }

    return res.status(401).json({ error: "Tenant requerido (JWT/subdomain)" });
  } catch (err) {
    console.error("Tenant error:", err.message);
    res.status(403).json({ error: "Auth inválida" });
  }
};
