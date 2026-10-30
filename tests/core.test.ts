import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
// Stub only the external basemap presets; the layer helpers use ordinary style objects.
const source = stripTypeScriptTypes(
  (
    await readFile(
      new URL("../protomaps-muted-flavor.ts", import.meta.url),
      "utf8",
    )
  ).replace(
    'import { namedFlavor } from "@protomaps/basemaps";',
    "const namedFlavor = () => ({});",
  ),
);
const {
  lightFlavor,
  darkFlavor,
  withLandcover,
  withLabels,
  withRoadShields,
  shieldColors,
  installRoadShields,
  applyStarfield,
} = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const layers = () => [
  { id: "landcover", type: "fill", source: "map", paint: {} },
  { id: "places_country", type: "symbol", layout: {} },
  { id: "roads_shields", type: "symbol", layout: {}, paint: {} },
];

test("flavors and layer transforms are independent and composable", () => {
  assert.equal(lightFlavor.water, "#BAE8FA");
  assert.equal(darkFlavor.water, "#17265A");
  const custom = {
    ...lightFlavor,
    landcover: { ...lightFlavor.landcover, forest: "#000000" },
  };
  assert.notEqual(custom.landcover.forest, lightFlavor.landcover.forest);
  const original = layers();
  const saved = structuredClone(original);
  let output = withLandcover(original, "custom-land");
  output = withLabels(output, {
    font: "Arial",
    hidden: ["places_country"],
    dense: true,
    dark: true,
  });
  output = withRoadShields(output, shieldColors.light.text);
  assert.deepEqual(original, saved);
  assert.equal(
    output.find((l: { id: string }) => l.id === "landcover").source,
    "custom-land",
  );
  assert.equal(
    output.find((l: { id: string }) => l.id === "places_country").layout
      .visibility,
    "none",
  );
  assert.deepEqual(
    output.find((l: { id: string }) => l.id === "roads_shields").layout[
      "icon-image"
    ],
    ["concat", "rounded_shield_", ["length", ["get", "shield_text"]]],
  );
});

test("shields register on load and style changes, then unsubscribe", () => {
  const ctx = {
    scale() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    getImageData() {
      return {};
    },
  };
  globalThis.document = {
    createElement: () => ({ getContext: () => ctx }),
  } as unknown as Document;
  const images = new Map();
  let handler: (() => void) | undefined;
  let loaded = false;
  const map = {
    on(_name: string, fn: () => void) {
      handler = fn;
    },
    off(_name: string, fn: () => void) {
      if (handler === fn) handler = undefined;
    },
    isStyleLoaded() {
      return loaded;
    },
    hasImage(id: string) {
      return images.has(id);
    },
    addImage(id: string, image: unknown, options: unknown) {
      images.set(id, options);
    },
  };
  const dispose = installRoadShields(map, shieldColors.light);
  assert.equal(images.size, 0);
  loaded = true;
  handler!();
  assert.equal(images.size, 5);
  handler!();
  assert.equal(images.size, 5);
  images.clear();
  handler!();
  assert.equal(images.size, 5);
  dispose();
  assert.equal(handler, undefined);
  images.clear();
  const disposeLoaded = installRoadShields(map, shieldColors.dark);
  assert.equal(images.size, 5);
  disposeLoaded();
});

test("starfield restores original inline background", () => {
  const ctx = { beginPath() {}, arc() {}, fill() {} };
  globalThis.document = {
    createElement: () => ({
      getContext: () => ctx,
      toDataURL: () => "data:image/png;base64,abc",
    }),
  } as unknown as Document;
  const style = {
    backgroundImage: "old",
    backgroundSize: "cover",
    backgroundRepeat: "repeat",
    backgroundPosition: "center",
  };
  const restore = applyStarfield({ style });
  assert.match(style.backgroundImage, /data:image/);
  restore();
  assert.deepEqual(style, {
    backgroundImage: "old",
    backgroundSize: "cover",
    backgroundRepeat: "repeat",
    backgroundPosition: "center",
  });
});
