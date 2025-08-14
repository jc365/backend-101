import ScrapSource, { camposPermitidosBuscar } from "./model.js";
import crudApiFactory from "../_nucleo/crudApiFactory.js";
import * as commonUtils from "../_nucleo/common-utils.js";
import ScrapItem from "../scrapitem/model.js";
import ScrapRun from "../scraprun/model.js";
import { runPipeline } from "../../utils/scrapers/processScrap.js";
import crypto from "crypto";
import mongoose from "mongoose";

const baseController = crudApiFactory(ScrapSource, camposPermitidosBuscar);

function createHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

async function saveDetailResult(alias, detailUrl, detailData) {
  const hash = createHash({
    title: detailData.title,
    summary: detailData.summary,
  });
  const exists = await ScrapItem.findOne({ alias, hash });
  if (!exists) {
    await ScrapItem.create({
      alias,
      data: detailData,
      sourceUrl: detailUrl,
      hash,
      read: false,
      createdAt: new Date(),
    });
    return true;
  }
  return false;
}

export async function runPipelineTwoPhase(sourceConfig) {
  const runStart = new Date();
  const log = [];
  let newCount = 0;

  const listConfig = {
    url: sourceConfig.url,
    process: sourceConfig.listPipeline,
  };
  log.push(`▶ Ejecutando listPipeline para ${sourceConfig.alias}`);
  const listResult = await runPipeline(listConfig);

  const urls = (listResult || [])
    .map((item) => {
      if (item.url && !item.url.startsWith("http")) {
        return (sourceConfig.source || "") + item.url;
      }
      return item.url;
    })
    .filter(Boolean);

  log.push(`URLs encontradas: ${urls.length}`);

  const nuevos = [];
  for (const url of urls) {
    const exists = await ScrapItem.findOne({
      alias: sourceConfig.alias,
      sourceUrl: url,
    });
    if (!exists) nuevos.push(url);
  }
  log.push(`URLs nuevas: ${nuevos.length}`);

  for (const detailUrl of nuevos) {
    log.push(`▶ Ejecutando detailPipeline para ${detailUrl}`);
    const detailConfig = {
      url: detailUrl,
      process: sourceConfig.detailPipeline,
    };
    const detailResult = await runPipeline(detailConfig);
    if (await saveDetailResult(sourceConfig.alias, detailUrl, detailResult)) {
      newCount++;
      log.push(`✔ Guardado nuevo ítem: ${detailUrl}`);
    }
  }

  await ScrapRun.create({
    alias: sourceConfig.alias,
    runStartedAt: runStart,
    runEndedAt: new Date(),
    newItemsCount: newCount,
    removedItemsCount: 0,
    log,
  });

  return { newCount, log };
}

export async function runTwoPhases(req, res) {
  try {
    // mongoose.set("strictQuery", false);
    const sourceConfig = await ScrapSource.findOne({
      alias: req.params.alias,
      active: true,
    }).lean();
    if (!sourceConfig)
      return res.status(404).json({ error: "Source no encontrado" });
    const result = await runPipelineTwoPhase(sourceConfig);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default {
  ...baseController,
  saveDetailResult,
  runPipelineTwoPhase,
  runTwoPhases,
};
