// models/Tenant.js
import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    days: [String], // ["MO","TU","WE","TH","FR"]
    start: String, // "09:00"
    end: String, // "18:00"
    rrule: String, // Backend generated
  },
  { _id: false }
);

const HolidaySchema = new mongoose.Schema(
  {
    label: String,
    date: String, // "2026-12-25"
    rrule: String, // Anuales: "FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25"
  },
  { _id: false }
);

const BreakSchema = new mongoose.Schema(
  {
    day_key: String, // "mon", "tue"
    day_label: String, // "Monday"
    start: String, // "12:00"
    end: String, // "13:00"
    label: String, // "Lunch break"
  },
  { _id: false }
);

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
    minutes_slot: { type: Number, default: 15 }, // 15,30
    accept_appointment_custom: { type: Boolean, default: true },

    //     subdomain: { type: String, unique: true, sparse: true }, // mcarthur.tudominio.com
    //     stripePublishableKey: String,
    //     stripeSecretKey: { type: String, select: false },
    //     sheetsId: String, // Google Sheet por tenant

    general_schedule: [ScheduleSchema],
    general_holidays: [HolidaySchema],
    general_breaks: [BreakSchema],
  },
  {
    timestamps: true,
  }
);

export const camposPermitidosBuscar = ["name"];

export default mongoose.model("Tenant", TenantSchema);
