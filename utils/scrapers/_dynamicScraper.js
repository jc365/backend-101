import puppeteer from 'puppeteer';
import { analyzeTags } from '../../utils/tagAnalyzer.js'
import { collectTags } from '../../utils/tagCollect.js'

export async function dynamicScraper(url) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10...) Safari/537.36");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    const html = await page.content();
    await browser.close();

    // return analyzeTags(html);
    return collectTags(html);
  } catch (err) {
    throw new Error("Dynamic scraper failed: " + err.message);
  }
}
