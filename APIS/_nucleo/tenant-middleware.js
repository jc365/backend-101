import jwt from "jsonwebtoken";
import Tenant from "../tenant/model.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const isDev =
  process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development";

export const tenantMiddleware = async (req, res, next) => {
  try {
    // if (isDev) console.log("  🔍 ", req.method, req.baseUrl || req.path);
    if (isDev)
      console.log("🔍 DEBUG:", {
        path: req.path,
        baseUrl: req.baseUrl,
        query: req.query, // ← ¿admin=true llega?
        host: req.get("host"),
      });

    if (req.path === "/login") {
      if (isDev) console.log("  ✅ Bypass para /login");
      return next(); // Público
    }

    // Bypass creación tenants mientras pruebas
    if (isDev && req.method === "POST" && req.baseUrl?.includes("tenants")) {
      if (isDev) console.log("  ✅ Bypass tenants POST");
      return next();
    }

    if (isDev)
      console.log(
        ">🔍 tenantId FINAL:",
        req.tenantId ? req.tenantId.toString() : "NULL"
      );

    // JWT (frontend login)
    const auth = req.headers.authorization;
    if (isDev)
      console.log(
        "🔐 JWT auth header:",
        auth,
        " - Headers recibidos:",
        req.headers
      );

    if (auth?.startsWith("Bearer ")) {
      console.log("✅ Bearer detectado"); // ← AÑADE
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ JWT decoded:", decoded.tenantId); // ← AÑADE
      req.tenantId = decoded.tenantId;
      return next();
    }

    // if (auth?.startsWith("Bearer ")) {
    //   const token = auth.slice(7);
    //   const decoded = jwt.verify(token, JWT_SECRET);
    //   req.tenantId = decoded.tenantId;
    //   return next();
    // }

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
