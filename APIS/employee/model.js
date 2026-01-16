import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    role: { type: String, enum: ["barber", "stylist"], default: "barber" },
    scheduleRRule: {
      type: String,
      required: true, // FREQ=WEEKLY;BYDAY=MO-FR;BYHOUR=09,10,...,19
      example:
        "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=09,10,11,12,13,14,15,16,17,18,19",
    },
    breaks: [{ startHour: String, endHour: String }], // 13:00-14:00
    durationDefault: { type: Number, default: 30 }, // Minutos
    color: String, // Para FullCalendar UI
  },
  { timestamps: true }
);

schema.index({ tenantId: 1, name: 1 });

export const camposPermitidosBuscar = ["name", "role"];
export default mongoose.model("Employee", schema);
