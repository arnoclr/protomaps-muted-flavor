import type { LayerSpecification, Map as MapLibreMap } from "maplibre-gl";
import type { Protocol as PMTilesProtocol } from "pmtiles";

declare global {
  interface Window {
    maplibregl: typeof import("maplibre-gl");
    pmtiles: { Protocol: typeof PMTilesProtocol };
    exampleMap: MapLibreMap;
    mapError?: string;
  }
}
const maplibregl = window.maplibregl;
import { layers } from "@protomaps/basemaps";
const { Protocol } = window.pmtiles;
import {
  applyStarfield,
  darkFlavor,
  insertLayer,
  installRoadShields,
  lightFlavor,
  shieldColors,
  withLabels,
  withLandcover,
  withRoadShields,
} from "../protomaps-muted-flavor.ts";
const query = new URLSearchParams(location.search);
const dark = query.get("theme") === "dark";
const theme = dark ? darkFlavor : lightFlavor;
const colors = shieldColors[dark ? "dark" : "light"];
const tileUrl = query.get("tiles") || "/tiles/map.pmtiles";
const absoluteTileUrl = new URL(tileUrl, location.href).href;
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
const container = document.getElementById("map")!;
applyStarfield(container);
// Generate ordinary MapLibre layers, then apply only the options you need.
let mapLayers = layers("protomaps", theme, { lang: "fr" });
mapLayers = withLandcover(mapLayers, "landcover");
mapLayers = withLabels(mapLayers, {
  font: "Arial",
  dense: true,
  dark,
  hidden: [
    "places_country",
    "places_region",
    "places_subplace",
    "earth_label_islands",
  ],
});
mapLayers = withRoadShields(mapLayers, colors.text);
const continents = [
  ["Afrique", 19, 3],
  ["Amérique du Nord", -101, 45],
  ["Amérique du Sud", -60, -15],
  ["Asie", 92, 45],
  ["Europe", 16, 52],
  ["Océanie", 134, -25],
  ["Antarctique", 20, -77],
] as const;
const continentLayer: LayerSpecification = {
  id: "continents_label",
  type: "symbol",
  source: "continents",
  minzoom: 0,
  maxzoom: 7,
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Arial"],
    "text-size": ["interpolate", ["linear"], ["zoom"], 0, 13, 4, 21],
    "text-letter-spacing": 0.12,
    "text-max-width": 8,
    "text-transform": "uppercase",
  },
  paint: {
    "text-color": theme.roads_label_major,
    "text-halo-color": theme.roads_label_major_halo,
    "text-halo-width": 1,
  },
};
mapLayers = insertLayer(mapLayers, continentLayer);
// Layers can still be edited directly after applying the helpers.
const city = mapLayers.find((layer) => layer.id === "places_locality");
if (city?.type === "symbol") {
  city.layout = { ...city.layout, "text-allow-overlap": false };
}
const map = new maplibregl.Map({
  container,
  center: [2, 46.6],
  zoom: 5,
  style: {
    version: 8,
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${absoluteTileUrl}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
      landcover: {
        type: "vector",
        url: `pmtiles://${absoluteTileUrl}`,
        maxzoom: 7,
      },
      continents: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: continents.map(([name, lng, lat]) => ({
            type: "Feature",
            properties: { name },
            geometry: { type: "Point", coordinates: [lng, lat] },
          })),
        },
      },
    },
    layers: mapLayers,
  },
});
installRoadShields(map, colors);
map.on("style.load", () => map.setProjection({ type: "globe" }));
// Expose the map and errors to the screenshot generator.
map.on("error", (event) => {
  console.error("Map error:", event.error);
  window.mapError = String(event.error);
});
window.exampleMap = map;
