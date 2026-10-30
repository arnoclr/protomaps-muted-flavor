import type {} from "../example/main.ts";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
const port = 4178;
const server = spawn(process.execPath, ["scripts/server.ts"], {
  stdio: "inherit",
  env: process.env,
});
let browser: import("playwright").Browser | undefined;
try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
    } catch {}
    await delay(200);
  }
  const currentBrowser: import("playwright").Browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
    args: ["--enable-webgl", "--ignore-gpu-blocklist"],
  });
  browser = currentBrowser;
  await mkdir("screenshots", { recursive: true });
  const views: [string, [number, number], number][] = [
    ["france", [2, 46.6], 5],
    ["marne-la-vallee", [2.746, 48.855], 10],
    ["bussy-saint-georges", [2.708, 48.841], 14],
  ];
  for (const theme of ["light", "dark"])
    for (const [name, center, zoom] of views) {
      const page = await currentBrowser.newPage({
        viewport: { width: 1200, height: 750 },
        deviceScaleFactor: 1,
      });
      page.on("pageerror", (error) => console.error(error));
      page.on("console", (message) => {
        if (message.type() === "error")
          console.error("Browser:", message.text());
      });
      page.on("requestfailed", (request) =>
        console.error(
          "Request failed:",
          request.url(),
          request.failure()?.errorText,
        ),
      );
      await page.goto(`http://127.0.0.1:${port}/?theme=${theme}`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForFunction(() => window.exampleMap?.loaded(), null, {
        timeout: 60000,
      });
      await page.evaluate(
        ({ center, zoom }) => {
          window.exampleMap.jumpTo({ center, zoom });
        },
        { center, zoom },
      );
      await page.waitForFunction(
        () => window.exampleMap.loaded() && window.exampleMap.areTilesLoaded(),
        null,
        { timeout: 60000 },
      );
      await page.waitForTimeout(1000);
      const mapError = await page.evaluate(() => window.mapError);
      if (mapError) throw new Error(`Map failed: ${mapError}`);
      await page.screenshot({ path: `screenshots/${theme}-${name}.png` });
      console.log(`Generated ${theme}-${name}.png`);
      await page.close();
    }
} finally {
  await browser?.close();
  server.kill();
}
