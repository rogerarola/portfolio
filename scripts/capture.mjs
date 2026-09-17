// Captures the screenshots used by the carousel.
//   npm install && npx playwright install chromium && npm run shots
// Output: assets/shots/<id>-1.jpg ... <id>-3.jpg (1600x1000, top of the page + two sections further down)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const SITES = [
  { id: "arla", url: "https://arlamusic.com" },
  { id: "pulso", url: "https://pulso-studios.com" },
  { id: "far", url: "https://farcoaching.com" },
];
// where to scroll for each shot, as a fraction of the scrollable height
const STOPS = [0, 0.3, 0.62];
const OUT = new URL("../assets/shots/", import.meta.url);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

for (const site of SITES) {
  const page = await context.newPage();
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500); // let intro animations finish
    const scrollable = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    for (const [n, stop] of STOPS.entries()) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(scrollable * stop));
      await page.waitForTimeout(1500); // scroll-triggered reveals
      const file = new URL(`${site.id}-${n + 1}.jpg`, OUT);
      await page.screenshot({ path: file.pathname, type: "jpeg", quality: 82 });
      console.log("saved", `assets/shots/${site.id}-${n + 1}.jpg`);
    }
  } catch (err) {
    console.error(`! ${site.id}: ${err.message}`);
  }
  await page.close();
}
await browser.close();
