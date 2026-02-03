import mongoose from 'mongoose';  
import Employee, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";

const baseController = crudApiFactory(Employee, camposPermitidosBuscar);

// employee/controller.js - TOP

async function bulkUpdateEmployees(req, res) {
  const employees = req.body;
  const tenantId = req.tenantId;

  // 1. DELETE
  const currentIds = await Employee.find({ tenantId }).distinct('_id');
  const draftIds = employees.map(e => new mongoose.Types.ObjectId(e._id));  
  const toDelete = currentIds.filter(id => !draftIds.includes(id));
  if (toDelete.length > 0) {
    await Employee.deleteMany({ _id: { $in: toDelete } });
  }

  // 2. UPSERT
  for (const emp of employees) {
    await Employee.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(emp._id) },
      { 
        $set: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          name: emp.name,
          role: emp.role || 'barber',
          sw_general_schedule: emp.sw_general_schedule,
          custom_schedule: emp.custom_schedule || [],
          custom_holidays: emp.custom_holidays || [],
          scheduleRRule: emp.scheduleRRule,
          durationDefault: emp.durationDefault || 30,
          breaks: emp.breaks || [],
          timezone: emp.timezone,
        }
      },
      { upsert: true, new: true }
    );
  }

  res.json({ 
    status: 'success', 
    message: `${employees.length} empleados sincronizados` 
  });
}

// Example of our own method outside the factory: search powerfull about especific fields's resource
// It is necessary to add it to the export default along with baseController
// Also needs...... import paginate from "../_nucleo/paginate.js";
//
// async function specialMethod(req, res) {
//   try {
//     const q = req.query.q || ""; //-- q = 'hello world'
//     const terms = q.trim().split(/\s+/).filter(Boolean); //-- split for every word
//     const fields = ["title", "name"]; //-- search fields
//     let filter = commonUtils.buildFilter(terms, fields); //-- make filter for mongo
//     //-- filter has a query Mongo for search 'hello' or 'world' in 'title' or 'name'
//     const baseUrl = req.baseUrl + req.path;
//     const resultado = await paginate(Employee, req, baseUrl, filter);
//     return commonUtils.sendSuccess(
//       res,
//       resultado.data,
//       "Listado obtenido correctamente",
//       200,
//       resultado.pagination,
//       resultado.links
//     );
//   } catch (err) {
//     return commonUtils.sendError(res, err.message, 400);
//   }
// }

export default {
  ...baseController,
  bulkUpdateEmployees,
};
