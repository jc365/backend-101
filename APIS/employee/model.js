// models/Employee.js
import mongoose from "mongoose";
// import cleanDuplicates from "../../utils/reservas/validateScheduleDays";

const EmployeeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["worker", "manager", "admin"],
      default: "worker",
    },

    sw_general_schedule: { type: Boolean, default: true }, // ✅ Referencia

    custom_schedule: [
      {
        // Solo si false
        label: String,
        days: [String],
        start: String,
        end: String,
        rrule: String,
      },
    ],

    custom_holidays: [
      {
        label: String,
        date: String,
        rrule: String,
      },
    ],
  },
  { timestamps: true }
);

EmployeeSchema.pre("save", async function (next) {
  try {
    // Clean duplicates
    this.custom_schedule = cleanDuplicates(this.custom_schedule);
    this.custom_holidays = cleanDuplicates(this.custom_holidays);

    // Validate days if custom
    if (!this.sw_general_schedule && this.custom_schedule.length) {
      const tenant = await Tenant.findById(this.tenantId, "general_schedule");
      const generalDays = new Set();
      tenant.general_schedule.forEach((s) =>
        s.days.forEach((d) => generalDays.add(d))
      );

      for (const custom of this.custom_schedule) {
        const error = validateCustomDays(custom.days, generalDays);
        if (error) return next(new Error(error));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

EmployeeSchema.index({ tenantId: 1, name: 1 });

export const camposPermitidosBuscar = ["name"];
export default mongoose.model("Employee", EmployeeSchema);
