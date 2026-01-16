import Reservation, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import Employee from "../employee/model.js";
import mongoose from "mongoose";
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
const isDev = process.env.NODE_ENV === "local";

export const getAvailability = async (req, res) => {
  if (isDev) console.log("🔍 getAvailability - Parms request:", req.query);
  try {
    const {
      date,
      duration = "30",
      tenantId: queryTenantId,
      empId = "all",
    } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ status: "error", message: "date requerido (YYYY-MM-DD)" });

    const filterTenant = req.tenantId || queryTenantId;
    if (!filterTenant)
      return res
        .status(400)
        .json({ status: "error", message: "tenantId requerido" });

    if (isDev)
      console.log("🔍 getAvailability - Pre-Mongo: ", {
        date,
        duration,
        filterTenant,
        empId,
      });

    const objTenantId = new mongoose.Types.ObjectId(filterTenant);
    const employees =
      empId === "all"
        ? await Employee.find({ tenantId: objTenantId })
        : await Employee.find({ tenantId: objTenantId, _id: empId });

    if (employees.length === 0) {
      return res.json({
        status: "success",
        message: "Sin empleados",
        data: [],
      });
    }

    const targetDate = parseISO(date);
    const serviceDuration = parseInt(duration);
    const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const targetDay = dayNames[targetDate.getDay()];

    const availability = [];

    for (const emp of employees) {
      // Parse RRULE
      const byhourMatch = emp.scheduleRRule.match(/BYHOUR[=:]([^;\s]+)/i);
      const hours = byhourMatch
        ? byhourMatch[1].split(",").map((h) => parseInt(h))
        : [];

      const bydayMatch = emp.scheduleRRule.match(/BYDAY[=:]([^;\s]+)/i);
      const allowedDays = bydayMatch ? bydayMatch[1].split(",") : dayNames;

      if (!allowedDays.includes(targetDay) || hours.length === 0) {
        availability.push({ employeeId: emp._id, name: emp.name, slots: [] });
        continue;
      }

      const slots = [];
      const minHour = Math.min(...hours);
      const maxHour = Math.max(...hours);

      for (let h = minHour; h <= maxHour; h++) {
        for (let m = 0; m < 60; m += 15) {
          // ✅ Fechas (UTC directo)
          const slotStart = new Date(
            Date.UTC(
              targetDate.getFullYear(),
              targetDate.getMonth(),
              targetDate.getDate(),
              h, // 09 → 09:00 UTC exacto
              m,
              0
            )
          );
          const slotEnd = new Date(
            slotStart.getTime() + serviceDuration * 60 * 1000
          );

          // Formatted SIMPLES
          const formatted = `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`;

          // const hasOverlap = await Reservation.countDocuments({...});
          // Overlap check
          const hasOverlap = await Reservation.countDocuments({
            tenantId: objTenantId,
            employeeId: emp._id,
            $or: [
              { start: { $lt: slotEnd, $gte: slotStart } },
              { start: { $lte: slotStart }, end: { $gt: slotStart } },
            ],
          });

          if (!hasOverlap) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              formatted, // "09:00" exacto
              duration: serviceDuration,
            });
          }
        }
      }

      availability.push({
        employeeId: emp._id,
        name: emp.name,
        slots,
      });
    }

    res.json({
      status: "success",
      message: "Disponibilidad calculada",
      data: availability,
    });
  } catch (err) {
    console.error("getAvailability ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      employeeId,
      clientName,
      clientPhone,
      clientEmail,
      start,
      duration = 30,
      notes = "",
    } = req.body;

    // CHECK start/slotStart
    const slotStart = new Date(start);
    if (isDev)
      console.log(
        "🔍 bookAppointment - Body request:",
        req.body,
        " - slotStart:",
        slotStart.toISOString()
      );

    if (isNaN(slotStart.getTime())) {
      return res.status(400).json({ error: "start inválido (ISO UTC)" });
    }

    const filterTenant = req.tenantId || req.query.tenantId;
    if (!filterTenant)
      return res.status(400).json({ error: "tenantId requerido" });

    const objTenantId = new mongoose.Types.ObjectId(filterTenant);
    const objEmployeeId = new mongoose.Types.ObjectId(employeeId);

    // const slotStart = new Date(start);
    const slotEnd = new Date(
      slotStart.getTime() + parseInt(duration) * 60 * 1000
    );

    // 1. Overlap check
    const overlap = await Reservation.countDocuments({
      tenantId: objTenantId,
      employeeId: objEmployeeId,
      $or: [
        { start: { $lt: slotEnd, $gte: slotStart } },
        { start: { $lte: slotStart }, end: { $gt: slotStart } },
      ],
    });

    if (overlap > 0) {
      return res.status(409).json({
        status: "error",
        message: "Slot ocupado",
      });
    }

    // 2. Create
    const reservation = new Reservation({
      tenantId: objTenantId,
      employeeId: objEmployeeId,
      clientName,
      clientPhone,
      clientEmail,
      notes,
      start: slotStart,
      end: slotEnd,
      duration: parseInt(duration),
    });

    await reservation.save();

    res.json({
      status: "success",
      message: "Reserva creada",
      data: reservation,
    });
  } catch (err) {
    console.error("bookAppointment ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export default {
  ...baseController,
  getAvailability, // ← Exporta customs
  bookAppointment, // ← Exporta customs
};
