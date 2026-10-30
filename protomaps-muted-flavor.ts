import { namedFlavor } from "@protomaps/basemaps";
import type { LayerSpecification, Map as MapLibreMap } from "maplibre-gl";

interface MutableLayer {
  id: string;
  type: string;
  source?: string;
  minzoom?: number;
  filter?: unknown;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
}

export interface LabelOptions {
  font?: string;
  hidden?: string[];
  dense?: boolean;
  dark?: boolean;
}

export interface ShieldColors {
  fill: string;
  border: string;
}
export const lightFlavor = Object.assign({}, namedFlavor("light"), {
  background: "transparent",
  landcover: {
    grassland: "#D3EAB9",
    barren: "#F5EDD4",
    forest: "#C7E1A9",
    farmland: "#DEEBBC",
    glacier: "#F5F5F5",
    scrub: "#e8f6d8ff",
    urban_area: "#EEECE6",
  },
  water: "#BAE8FA",
  major: "#E1E1D9",
  major_casing_early: "#E0E5E1",
  major_casing_late: "#E0E5E1",
  minor_a: "#E1E1D9",
  minor_b: "#E1E1D9",
  minor_casing: "#E1E1D9",
  minor_service: "#E1E1D9",
  minor_service_casing: "#E1E1D9",
  link: "#E1E1D9",
  link_casing: "#E1E1D9",
  other: "#E1E1D9",
  highway_casing_early: "#D0D0C3",
  highway_casing_late: "#D0D0C3",
  bridges_highway: "#E1E1D9",
  bridges_highway_casing: "#D0D0C3",
  bridges_major: "#E1E1D9",
  bridges_major_casing: "#E0E5E1",
  bridges_minor: "#E1E1D9",
  bridges_minor_casing: "#E1E1D9",
  bridges_link: "#E1E1D9",
  bridges_link_casing: "#E1E1D9",
  bridges_other: "#E1E1D9",
  bridges_other_casing: "#E1E1D9",
  tunnel_highway: "#E1E1D9",
  tunnel_highway_casing: "#D0D0C3",
  tunnel_major: "#E1E1D9",
  tunnel_major_casing: "#E0E5E1",
  tunnel_minor: "#E1E1D9",
  tunnel_minor_casing: "#E1E1D9",
  tunnel_link: "#E1E1D9",
  tunnel_link_casing: "#E1E1D9",
  tunnel_other: "#E1E1D9",
  tunnel_other_casing: "#E1E1D9",
  earth: "#FAFAF3",
  pois: {
    blue: "#4089A8",
    green: "#408045",
    lapis: "#4089A8",
    pink: "#AA4280",
    red: "#FF0000",
    slategray: "#5B5E6F",
    tangerine: "#896B21",
    turquoise: "#4089A8",
  },
  wood_b: "#ECF3E4",
  park_b: "#E4F2DE",
  beach: "#F7F3D8",
  aerodrome: "#DFE7EE",
  buildings: "#F0F0EF",
  pier: "#F4F0EC",
  pedestrian: "#EFEDED",
  school: "#6f35111d",
  hospital: "#f5929237",
  scrub_a: "orange",
  scrub_b: "#ffffff20",
  highway: "#E1E1D9",
  runway: "#E1E1DA",
  boundaries: "#9e15418b",
  industrial: "#F4F0EC",
  military: "red",
  city_label: "#A6A4A0",
  address_label: "#A6A4A0",
  state_label: "#A6A4A0",
  subplace_label: "#A6A4A0",
});
export const darkFlavor = Object.assign({}, namedFlavor("dark"), {
  background: "transparent",
  landcover: {
    grassland: "#2C554F",
    urban_area: "#1D2E43",
    farmland: "#0E4D51",
    forest: "#094851",
    barren: "#4D514E",
    scrub: "#1B3B4D",
    glacier: "#516284",
  },
  wood_a: "#0E4148",
  wood_b: "#004848",
  park_a: "#00543B",
  park_b: "#004848",
  earth: "#1D3043",
  glacier: "#516284",
  buildings: "#283950",
  water: "#17265A",
  aerodrome: "#223556",
  ocean_label: "#3D5887",
  major: "#3A4D62",
  major_casing_early: "#344559",
  major_casing_late: "#344559",
  bridges_major: "#3A4D62",
  minor_a: "#35475D",
  minor_b: "#35475D",
  minor_casing: "#324155",
  link: "#35475D",
  other: "#35475D",
  minor_service: "#35475D",
  bridges_link: "#35475D",
  bridges_minor: "#35475D",
  bridges_other: "#35475D",
  boundaries: "#40314D",
  city_label: "#8391A3",
  city_label_halo: "rgba(0,0,0,0.6)",
  country_label: "#E2E9F5",
  address_label: "#60738F",
  state_label: "#8391A3",
  state_label_halo: "rgba(0,0,0,0.6)",
  subplace_label: "#8391A3",
  subplace_label_halo: "rgba(0,0,0,0.6)",
  industrial: "#28394F",
  scrub_a: "#0D4047",
  scrub_b: "#0D404720",
  tunnel_other: "#35475D",
  tunnel_minor: "#35475D",
  tunnel_link: "#35475D",
  tunnel_major: "#3A4D62",
  tunnel_highway: "#475970",
  highway: "#475970",
  bridges_highway: "#475970",
  runway: "#2B3748",
  pier: "#26374B",
  roads_label_minor: "#607390",
  roads_label_minor_halo: "#1C263B",
  roads_label_major: "#607390",
  roads_label_major_halo: "#1C263B",
});

const edit = (
  layers: LayerSpecification[],
  fn: (layer: MutableLayer) => void,
): LayerSpecification[] =>
  layers.map((layer) => {
    const copy = structuredClone(layer) as unknown as MutableLayer;
    fn(copy);
    return copy as unknown as LayerSpecification;
  });
/** Use a separately configured vector source to limit landcover's source zoom. */
export function withLandcover(layers: LayerSpecification[], source: string) {
  return edit(layers, (l) => {
    if (l.id === "landcover") {
      l.source = source;
      l.paint ??= {};
      l.paint["fill-opacity"] = [
        "interpolate",
        ["linear"],
        ["zoom"],
        6,
        1,
        11,
        0,
      ];
    }
  });
}
/** Optional label customizations. A font must be available from the configured glyph endpoint. */
export function withLabels(
  layers: LayerSpecification[],
  options: LabelOptions = {},
) {
  const dense: Record<string, unknown> = {
    places_subplace: [
      "in",
      ["get", "kind"],
      ["literal", ["neighbourhood", "macrohood"]],
    ],
    places_region: ["==", ["get", "kind"], "region"],
    places_locality: ["==", ["get", "kind"], "locality"],
  };
  return edit(layers, (l) => {
    if (options.hidden?.includes(l.id)) {
      l.layout ??= {};
      l.layout.visibility = "none";
    }
    if (options.font && l.type === "symbol" && l.layout?.["text-field"]) {
      const old = l.layout["text-font"];
      const first =
        Array.isArray(old) && typeof old[0] === "string" ? old[0] : "";
      l.layout["text-font"] = [
        options.font +
          (/italic|oblique/i.test(first)
            ? " Italic"
            : /bold|medium|semibold/i.test(first)
              ? " Bold"
              : ""),
      ];
    }
    if (options.dense && dense[l.id])
      l.filter = [
        "all",
        dense[l.id],
        [
          "any",
          ["!=", ["typeof", ["get", "min_zoom"]], "number"],
          ["<=", ["get", "min_zoom"], ["zoom"]],
        ],
      ];
    if (options.dark && l.paint) {
      if (l.id === "places_locality") {
        l.paint["text-color"] = [
          "case",
          [">=", ["get", "population_rank"], 10],
          "#E2E9F5",
          "#8391A3",
        ];
        l.paint["text-halo-color"] = "rgba(0,0,0,0.6)";
      }
      if (l.id === "places_country") {
        l.paint["text-color"] = "#E2E9F5";
        l.paint["text-halo-color"] = "rgba(0,0,0,0.6)";
      }
      if (
        [
          "water_waterway_label",
          "water_label_ocean",
          "water_label_lakes",
        ].includes(l.id)
      ) {
        l.paint["text-color"] = "#3D5887";
        l.paint["text-halo-color"] = "#0C1C47";
      }
    }
  });
}
export const shieldColors = {
  light: { fill: "#FFEDB5", border: "#F7E4C9", text: "#C3C3C3" },
  dark: { fill: "#766323", border: "#6D5531", text: "#323231" },
};
export function withRoadShields(
  layers: LayerSpecification[],
  textColor: string,
) {
  return edit(layers, (l) => {
    if (l.id !== "roads_shields") return;
    l.layout ??= {};
    l.paint ??= {};
    l.layout["icon-image"] = [
      "concat",
      "rounded_shield_",
      ["length", ["get", "shield_text"]],
    ];
    l.minzoom = 10;
    l.filter = [
      "all",
      ["in", ["get", "kind"], ["literal", ["highway", "major_road"]]],
      ["has", "shield_text"],
      ["<=", ["length", ["get", "shield_text"]], 5],
      [
        "any",
        ["!=", ["typeof", ["get", "min_zoom"]], "number"],
        ["<=", ["+", ["get", "min_zoom"], 5], ["zoom"]],
      ],
    ];
    l.paint["text-color"] = textColor;
  });
}
/** Insert any caller-defined layer before an existing layer, or at the end. */
export function insertLayer(
  layers: LayerSpecification[],
  layer: LayerSpecification,
  before = "places_subplace",
) {
  const result = structuredClone(layers);
  const index = result.findIndex((l) => l.id === before);
  result.splice(index < 0 ? result.length : index, 0, structuredClone(layer));
  return result;
}

const widths = [19, 24, 33, 38, 45];
function shield(width: number, colors: ShieldColors): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = 36;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  ctx.scale(2, 2);
  const x = 0.75,
    y = 0.75,
    w = width - 1.5,
    h = 16.5,
    r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colors.border;
  ctx.stroke();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
/** Register images now and whenever the map loads a new style. Dispose before removing the map. */
export function installRoadShields(
  map: MapLibreMap,
  colors: ShieldColors,
): () => void {
  let active = true;
  const register = () => {
    if (!active) return;
    widths.forEach((w, i) => {
      const id = `rounded_shield_${i + 1}`;
      if (!map.hasImage(id))
        map.addImage(id, shield(w, colors), { pixelRatio: 2 });
    });
  };
  map.on("style.load", register);
  if (map.isStyleLoaded()) register();
  return () => {
    active = false;
    map.off("style.load", register);
  };
}
/** Apply the deterministic starfield to a map container and restore its previous background on cleanup. */
export function applyStarfield(element: HTMLElement): () => void {
  const previous = {
    image: element.style.backgroundImage,
    size: element.style.backgroundSize,
    repeat: element.style.backgroundRepeat,
    position: element.style.backgroundPosition,
  };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  let seed = 0x5eedc0de;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 190; i++) {
    const x = random() * 1024,
      y = random() * 1024,
      radius = random() < 0.88 ? 0.35 + random() * 0.55 : 0.9 + random() * 0.9,
      alpha = 0.18 + Math.pow(random(), 1.7) * 0.82;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
  element.style.backgroundImage = `url("${canvas.toDataURL("image/png")}"), radial-gradient(circle at 50% 50%, rgba(61,88,135,0.55) 0%, rgba(61,88,135,0.30) 32%, rgba(61,88,135,0.10) 58%, rgba(61,88,135,0) 78%)`;
  element.style.backgroundSize = "700px 700px, 100% 100%";
  element.style.backgroundRepeat = "repeat, no-repeat";
  element.style.backgroundPosition = "0 0, center";
  return () => {
    element.style.backgroundImage = previous.image;
    element.style.backgroundSize = previous.size;
    element.style.backgroundRepeat = previous.repeat;
    element.style.backgroundPosition = previous.position;
  };
}
