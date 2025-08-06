import Item, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";

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
