import ScrapItem, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";

const baseController = crudApiFactory(ScrapItem, camposPermitidosBuscar);

import mongoose from "mongoose";
// import { scrapScrapItem as ScrapItem } from "../models.js";

async function markScrapItemsAsRead(ids = [], alias = null) {
  const filter = {};
  if (ids.length) {
    filter._id = { $in: ids.map((id) => mongoose.Types.ObjectId(id)) };
  }
  if (alias) filter.alias = alias;
  const result = await ScrapItem.updateMany(filter, { $set: { read: true } });
  return result.modifiedCount;
}

async function getUnreadScrapItems(alias, limit = 20) {
  return await ScrapItem.find({ alias, read: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("data createdAt sourceUrl")
    .lean();
}

async function fxRouteUnread(req, res) {
  try {
    const items = await getUnreadScrapItems(
      req.params.alias,
      Number(req.query.limit) || 20
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function fxRouteMarkRead(req, res) {
  try {
    const { ids, alias } = req.body;
    const updated = await markScrapItemsAsRead(ids || [], alias || null);
    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default {
  ...baseController,
  fxRouteUnread,
  fxRouteMarkRead,
};
