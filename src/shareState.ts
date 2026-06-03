import { PatternSettings } from "./types";
import { normalizePatternSettings } from "./settings";

const SHARE_PARAM = "settings";

const SETTINGS_KEYS: (keyof PatternSettings)[] = [
  "type",
  "repetitions",
  "symmetry",
  "density",
  "strokeWidth",
  "spacing",
  "rotation",
  "scale",
  "complexity",
  "variant",
  "variation",
  "phase",
  "strokeStyle",
  "seed",
  "canvasSize",
  "inverted",
];

const toBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
};

export function encodeSettingsParam(settings: PatternSettings): string {
  const normalized = normalizePatternSettings(settings);
  const compact = SETTINGS_KEYS.reduce<Partial<PatternSettings>>((acc, key) => {
    acc[key] = normalized[key] as never;
    return acc;
  }, {});

  return toBase64Url(JSON.stringify(compact));
}

export function settingsFromSearch(search: string): PatternSettings | null {
  const value = new URLSearchParams(search).get(SHARE_PARAM);
  if (!value) return null;

  try {
    return normalizePatternSettings(JSON.parse(fromBase64Url(value)));
  } catch (err) {
    console.error("Failed to parse shared pattern settings:", err);
    return null;
  }
}

export function createShareUrl(settings: PatternSettings, href: string): string {
  const url = new URL(href);
  url.searchParams.set(SHARE_PARAM, encodeSettingsParam(settings));
  return url.toString();
}
