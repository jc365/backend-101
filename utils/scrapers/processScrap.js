// deps
import axios from "axios";
import puppeteer from "puppeteer";
// import {cheerio} from "cheerio";
import { load as cheerioLoad } from "cheerio";

/* --------------------------------------------------
   STEP: getHtml
-------------------------------------------------- */
async function getHtmlStep(url, { type }) {
  console.log(`=> getHtml. Type: ${type} - Url: ${url}`);
  let html = null;

  if (type === "dynamic") {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10...) Safari/537.36");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    html = await page.content();
    await browser.close();
  } else {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0;...) Chrome/119 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      timeout: 10000,
    });
    html = response.data;
  }
  return html;
}

/* --------------------------------------------------
   STEP: exploreHtml
-------------------------------------------------- */
function exploreHtmlStructure(html, sampleSize = 2) {
  const $ = cheerioLoad(html);
  const summary = [];

  $("*").each((_, el) => {
    const tag = el.tagName;
    const attrs = el.attribs;
    const text = $(el).text().trim();

    const selector =
      $(el).prop("tagName").toLowerCase() +
      (el.attribs.class ? "." + el.attribs.class.split(/\s+/).join(".") : "");

    let entry = summary.find((s) => s.selector === selector);
    if (!entry) {
      entry = {
        selector,
        tag,
        attributes: Object.keys(attrs),
        sample: [],
      };
      summary.push(entry);
    }

    if (entry.sample.length < sampleSize) {
      entry.sample.push({
        attributes: attrs,
        text: text.length > 50 ? text.slice(0, 50) + "..." : text,
      });
    }
  });

  return summary;
}

/* --------------------------------------------------
   STEP: extractFromHtml
-------------------------------------------------- */
function extractFromHtml(html, config) {
  const $ = cheerioLoad(html);
  const result = {};

  for (const { selector, fields } of config) {
    result[selector] = [];
    $(selector).each((_, el) => {
      const item = {};
      for (const field of fields) {
        if (typeof field === "string" && field === "text") {
          item.text = $(el).text().trim();
        } else if (typeof field === "object" && field.attr) {
          item[field.attr] = $(el).attr(field.attr) || null;
        }
      }
      result[selector].push(item);
    });
  }
  return result;
}

/* --------------------------------------------------
   STEP: cleanData
-------------------------------------------------- */
function cleanData(data, options) {
  const cleaned = {};
  for (const [selector, items] of Object.entries(data)) {
    let processed = items;
    if (options.trim) {
      processed = processed.map((obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [
            k,
            typeof v === "string" ? v.trim() : v,
          ])
        )
      );
    }
    if (options.removeDuplicates) {
      processed = Array.from(
        new Map(processed.map((item) => [JSON.stringify(item), item])).values()
      );
    }
    cleaned[selector] = processed;
  }
  return cleaned;
}

function filterData(data, filters) {
  const filtered = { ...data };

  for (const rule of filters) {
    const { selector, field, operator, value } = rule;
    if (!filtered[selector]) continue;

    filtered[selector] = filtered[selector].filter((item) => {
      const val = String(item[field] || "");

      switch (operator) {
        case "startsWith":
          return val.startsWith(value);
        case "notStartsWith":
          return !val.startsWith(value);
        case "equals":
          return val === value;
        case "notEquals":
          return val !== value;
        case "contains":
          return val.includes(value);
        case "notContains":
          return !val.includes(value);
        default:
          return true; // operador no reconocido: no filtramos
      }
    });
  }

  return filtered;
}

/* --------------------------------------------------
   Validador de config
-------------------------------------------------- */
function validateConfig(config) {
  const supportedSteps = [
    "getHtml",
    "exploreHtml",
    "extractFromHtml",
    "cleanData",
    "filterData",
  ];
  const errors = [];

  if (!config.url || typeof config.url !== "string") {
    errors.push(`Config: falta "url" o no es string`);
  }

  if (!Array.isArray(config.process) || config.process.length === 0) {
    errors.push(`Config: "process" debe ser un array no vacío`);
    return errors;
  }

  // comprobar que el primer paso es getHtml
  if (config.process[0].step !== "getHtml") {
    errors.push(`El primer paso debe ser "getHtml"`);
  }

  config.process.forEach((step, idx) => {
    if (!supportedSteps.includes(step.step)) {
      errors.push(`Paso ${idx}: step "${step.step}" no soportado`);
      return;
    }
    if (step.step === "getHtml") {
      if (typeof step.params !== "object" || !step.params.type) {
        errors.push(
          `Paso ${idx}: getHtml requiere { type: "static" | "dynamic" }`
        );
      }
    }
    if (step.step === "extractFromHtml") {
      if (!Array.isArray(step.params)) {
        errors.push(`Paso ${idx}: params debe ser un array`);
      } else {
        step.params.forEach((cfg, i) => {
          if (typeof cfg.selector !== "string" || !cfg.selector.trim()) {
            errors.push(`Paso ${idx}, config ${i}: selector inválido`);
          }
          if (!Array.isArray(cfg.fields) || cfg.fields.length === 0) {
            errors.push(`Paso ${idx}, config ${i}: fields debe ser un array`);
          }
        });
      }
    }
    if (step.step === "cleanData") {
      if (typeof step.params !== "object") {
        errors.push(`Paso ${idx}: params debe ser un objeto`);
      }
    }
    if (step.step === "exploreHtml") {
      if (step.params !== undefined && step.params !== null) {
        errors.push(`Paso ${idx}: exploreHtml no debería tener params`);
      }
    }
    if (step.step === "filterData") {
      if (!Array.isArray(step.params)) {
        errors.push(`Paso ${idx}: filterData requiere un array de reglas`);
      } else {
        step.params.forEach((rule, i) => {
          if (!rule.selector || !rule.field || !rule.operator) {
            errors.push(
              `Paso ${idx}, regla ${i}: falta selector, field u operator`
            );
          }
        });
      }
    }
  });

  return errors;
}

/* --------------------------------------------------
   Executor - runPipeline
-------------------------------------------------- */
export async function runPipeline(config) {
  const errors = validateConfig(config);
  if (errors.length) {
    throw new Error(`Errores de configuración:\n${errors.join("\n")}`);
  }

  let intermediateData = null;
  let currentHtml = null;

  for (const step of config.process) {
    switch (step.step) {
      case "getHtml":
        currentHtml = await getHtmlStep(config.url, step.params);
        break;
      case "exploreHtml":
        intermediateData = exploreHtmlStructure(currentHtml);
        break;
      case "filterData":
        if (!intermediateData) {
          throw new Error("No data to filter. Run extractFromHtml first.");
        }
        intermediateData = filterData(intermediateData, step.params);
        break;
      case "extractFromHtml":
        intermediateData = extractFromHtml(currentHtml, step.params);
        break;
      case "cleanData":
        intermediateData = cleanData(intermediateData, step.params);
        break;
      default:
        throw new Error(`Unknown step: ${step.step}`);
    }
  }
  return intermediateData;
}
