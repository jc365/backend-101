import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    clientName: { type: String, required: true },
    clientEmail: String,
    clientPhone: String,
    service: String,
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "paid"],
      default: "pending",
    },
    stripePaymentId: String,
    notes: String,
  },
  { timestamps: true }
);

schema.index({ tenantId: 1, employeeId: 1, start: 1 });
schema.index({ tenantId: 1, start: 1 });
export const camposPermitidosBuscar = ["clientName", "service"];
export default mongoose.model("Reservation", schema);
