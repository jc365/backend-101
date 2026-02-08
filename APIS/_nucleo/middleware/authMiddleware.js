// _nucleo/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Tenant from "../../tenant/model.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const isConsole = process.env.SW_CONSOLE === "true";
const isDev = process.env.NODE_ENV === "local";

// Auth genérico: acepta modelo dinámico sobre el que autenticar
export const authMiddleware = (model, selectFields = "-password") => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res
          .status(401)
          .json({ error: "No token, authorization denied" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      // 🔥 Modelo dinámico
      req.authUser = await model.findById(decoded.id).select(selectFields);
      if (!req.authUser) {
        return res.status(404).json({ error: `${model.modelName} not found` });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: "Token is not valid" });
    }
  };
};

// Factory helpers
export const tenantAuth = () => authMiddleware(Tenant);
// export const userAuth = () => authMiddleware(User); // cuando exista
export const adminAuth = () => authMiddleware(Admin);

