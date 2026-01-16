import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subdomain: { type: String, unique: true, sparse: true }, // mcarthur.tudominio.com
    stripePublishableKey: String,
    stripeSecretKey: { type: String, select: false }, // Nunca en queries
    sheetsId: String, // Google Sheet por tenant
    businessHours: String, // Default RRULE
    timezone: { type: String, default: "Europe/Madrid" },
  },
  { timestamps: true }
);

export const camposPermitidosBuscar = ["name"];
export default mongoose.model("Tenant", schema);
