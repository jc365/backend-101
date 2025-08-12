import axios from "axios";
import puppeteer from "puppeteer";

export default async function getHtml(url, type) {
  console.log(`=> getHtmle. Type: ${type} - Url: ${url}`);
  let html = null;

  try {
    if (type == "dynamic") {
      console.log("entra por dynamic");
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
      console.log("entra por static");
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0;...) Chrome/119 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: 10000, // 10 seconds
      });
      html = response.data;
    }
    return html;
  } catch (err) {
    console.log(`getHtml ${type} failed: ${err.message}`);
    // throw new Error(`getHtml ${type} failed: ${err.message}`);
  }
}
