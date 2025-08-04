// Controller of resource
import Item, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";

const baseController = crudApiFactory(Item, camposPermitidosBuscar);

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
