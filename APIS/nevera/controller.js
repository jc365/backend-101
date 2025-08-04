// Controller of resource
import Resource, { camposPermitidosBuscar } from "./model_prov.js";
import crudApiFactory from "../nucleo/crudApiFactory.js";

const baseController = crudApiFactory(Resource, camposPermitidosBuscar);

// Example of our own method outside the factory
async function getSpecial(req, res) {
  // ...
  // ...
  // ...
}

export default {
  ...baseController,
  getSpecial, //--method custom for this resource
};
