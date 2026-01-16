import Reservation, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import Employee from "../employee/model.js";
import {
  parseISO,
  addMinutes,
  isWithinInterval,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import pkg from "rrule";

const { RRule } = pkg.default || pkg;
const baseController = crudApiFactory(Reservation, camposPermitidosBuscar);

const getAvailability = async (req, res) => {
  try {
    const { date, duration = 30, emp = "all" } = req.query;
    const targetDate = parseISO(`${date}T00:00:00`);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Employees del tenant
    const employees =
      emp === "all"
        ? await Employee.find({ tenantId: req.tenantId })
        : await Employee.find({ tenantId: req.tenantId, _id: emp });

    const results = [];

    for (const employee of employees) {
      // 1. Slots schedule (rrule → horarios día)
      const rule = new RRule({
        rrule: employee.scheduleRRule,
        dtstart: targetDate,
      });
      const scheduleSlots = rule
        .all((rr) => rr >= dayStart && rr <= dayEnd)
        .map((start) => ({
          start,
          end: addMinutes(start, parseInt(duration)),
        }));

      // 2. Reservas ocupadas
      const bookings = await Reservation.find({
        tenantId: req.tenantId,
        employeeId: employee._id,
        start: { $lt: dayEnd },
        end: { $gt: dayStart },
      });

      // 3. Slots libres (no overlap)
      const freeSlots = scheduleSlots.filter(
        (slot) =>
          !bookings.some((b) =>
            isWithinInterval(slot.start, {
              start: b.start,
              end: b.end,
            })
          )
      );

      results.push({
        employeeId: employee._id,
        name: employee.name,
        slots: freeSlots.map((s) => format(s.start, "HH:mm")),
      });
    }

    commonUtils.sendSuccess(res, results, "Availability OK");
  } catch (err) {
    commonUtils.sendError(res, err.message);
  }
};

export default {
  ...baseController,
  getAvailability, // ← Exporta custom
};
