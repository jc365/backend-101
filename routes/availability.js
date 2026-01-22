// routes/availability.js
import express from "express";
import Employee from "../models/Employee.js";
import { getDayOfWeek, isHoliday } from "../_nucleo/rruleFactory.js";
import { tenantMiddleware } from "../_nucleo/tenant-middleware.js";

const router = express.Router();
router.use(tenantMiddleware);

router.get("/:empId", async (req, res) => {
  try {
    const { empId } = req.params;
    const { date = new Date().toISOString().slice(0, 10) } = req.query; // YYYY-MM-DD

    const emp = await Employee.findById(empId).populate("tenantId");
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const tenant = emp.tenantId;

    // 1. Base schedules (general or custom)
    let baseSchedules = tenant.general_schedule;
    if (!emp.sw_general_schedule && emp.custom_schedule?.length) {
      baseSchedules = emp.custom_schedule;
    }

    // 2. Today's schedule (matching day)
    const todayDay = getDayOfWeek(date);
    const todaySchedule = baseSchedules.find((s) => s.days.includes(todayDay));
    if (!todaySchedule) return res.json({ status: "success", data: [] });

    // 3. Check holidays
    const allHolidays = [
      ...tenant.general_holidays,
      ...(emp.custom_holidays || []),
    ];
    if (allHolidays.some((h) => isHoliday([h], date))) {
      return res.json({ status: "success", data: [] });
    }

    // 4. Generate slots
    const slots = [];
    const slotDuration = tenant.minutes_slot; // 15min
    const startHour = +todaySchedule.start.slice(0, 2);
    const endHour = +todaySchedule.end.slice(0, 2);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const slotEnd = addMinutes(slotStart, slotDuration);

        slots.push({
          start: `${date}T${slotStart}:00`,
          end: `${date}T${slotEnd}:00`,
          free: true, // TODO: check bookings
        });
      }
    }

    res.json({
      status: "success",
      data: slots,
      meta: {
        total_slots: slots.length,
        day: todayDay,
        schedule: todaySchedule.label,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(":").map(Number);
  let totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const newMins = (totalMinutes % 60).toString().padStart(2, "0");
  return `${newHours}:${newMins}`;
}

export default router;
