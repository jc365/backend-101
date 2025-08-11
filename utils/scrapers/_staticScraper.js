import axios from "axios";
import { analyzeTags } from "../tagAnalyzer.js";
import { collectTags } from "../tagCollect.js";

export async function staticScraper(url) {
  console.log('ejecutando staticScraper', url);
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0;...) Chrome/119 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      timeout: 10000, // 10 seconds
    });

    const html = response.data;
    return collectTags(html);
  } catch (err) {
    throw new Error("Static scraper failed: " + err.message);
  }
}
