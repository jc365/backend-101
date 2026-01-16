import Tenant, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
const baseController = crudApiFactory(Tenant, camposPermitidosBuscar);

// controller.js tenants
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

export default {
  ...baseController,
  tenantLogin,
};
