import { PatternSettings, PatternType, StrokeStyle } from "./types";

export interface PatternVariantOption {
  id: string;
  label: string;
}

export const PATTERN_TYPE_OPTIONS: {
  type: PatternType;
  label: string;
  desc: string;
}[] = [
  { type: "topography", label: "Topography", desc: "Contours and organic field lines" },
  { type: "rosace", label: "Rosette", desc: "Petals and interlacing loops" },
  { type: "mandala", label: "Mandala", desc: "Concentric geometric crowns" },
  { type: "fractal", label: "Fractal", desc: "Recursive branching crystals" },
  { type: "tessellation", label: "Tessellation", desc: "Repeating modular tiles" },
  { type: "grid", label: "Grid", desc: "Blueprint and drafting systems" },
  { type: "radial", label: "Radial", desc: "Rays, spirals and moire" },
  { type: "symmetry", label: "Symmetry", desc: "Mirrored seals and runes" },
  { type: "generative", label: "Spirograph", desc: "Orbits and hypotrochoids" },
  { type: "guilloche", label: "Guilloche", desc: "Security rosettes and ribbons" },
  { type: "woven", label: "Woven", desc: "Loom bands and Celtic knots" },
  { type: "lattice", label: "Lattice", desc: "Hex, star and crystal nets" },
];

export const STROKE_STYLE_OPTIONS: { value: StrokeStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export const PATTERN_VARIANTS: Record<PatternType, PatternVariantOption[]> = {
  topography: [
    { id: "classic", label: "Classic" },
    { id: "river", label: "River" },
    { id: "woodgrain", label: "Woodgrain" },
  ],
  rosace: [
    { id: "classic", label: "Classic" },
    { id: "petal", label: "Petal" },
    { id: "orbit", label: "Orbit" },
  ],
  mandala: [
    { id: "classic", label: "Classic" },
    { id: "lotus", label: "Lotus" },
    { id: "crown", label: "Crown" },
  ],
  fractal: [
    { id: "classic", label: "Classic" },
    { id: "crystal", label: "Crystal" },
    { id: "vine", label: "Vine" },
  ],
  tessellation: [
    { id: "classic", label: "Classic" },
    { id: "diamond", label: "Diamond" },
    { id: "rings", label: "Rings" },
  ],
  grid: [
    { id: "classic", label: "Classic" },
    { id: "isometric", label: "Isometric" },
    { id: "radar", label: "Radar" },
  ],
  radial: [
    { id: "classic", label: "Classic" },
    { id: "burst", label: "Burst" },
    { id: "spiral", label: "Spiral" },
  ],
  symmetry: [
    { id: "classic", label: "Classic" },
    { id: "rune", label: "Rune" },
    { id: "mirror", label: "Mirror" },
  ],
  generative: [
    { id: "classic", label: "Classic" },
    { id: "flower", label: "Flower" },
    { id: "orbit", label: "Orbit" },
  ],
  guilloche: [
    { id: "classic", label: "Classic" },
    { id: "medallion", label: "Medallion" },
    { id: "ribbon", label: "Ribbon" },
  ],
  woven: [
    { id: "classic", label: "Classic" },
    { id: "celtic", label: "Celtic" },
    { id: "basket", label: "Basket" },
  ],
  lattice: [
    { id: "classic", label: "Classic" },
    { id: "star", label: "Star" },
    { id: "quasicrystal", label: "Quasicrystal" },
  ],
};

export const DEFAULT_PATTERN_SETTINGS: PatternSettings = {
  type: "rosace",
  repetitions: 12,
  symmetry: 6,
  density: 0.6,
  strokeWidth: 2.0,
  spacing: 0.25,
  rotation: 0,
  scale: 1.0,
  complexity: 4,
  variant: "classic",
  variation: 0.35,
  phase: 0,
  strokeStyle: "solid",
  seed: 120,
  canvasSize: 800,
  inverted: false,
};

const patternTypes = new Set<PatternType>(PATTERN_TYPE_OPTIONS.map((option) => option.type));
const strokeStyles = new Set<StrokeStyle>(STROKE_STYLE_OPTIONS.map((option) => option.value));

const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getDefaultVariant = (type: PatternType): string => PATTERN_VARIANTS[type][0].id;

export const getPatternVariantOptions = (type: PatternType): PatternVariantOption[] =>
  PATTERN_VARIANTS[type];

export const isPatternType = (value: unknown): value is PatternType =>
  typeof value === "string" && patternTypes.has(value as PatternType);

export function normalizePatternSettings(
  input: Partial<PatternSettings> | null | undefined,
): PatternSettings {
  const raw = input ?? {};
  const type = isPatternType(raw.type) ? raw.type : DEFAULT_PATTERN_SETTINGS.type;
  const variantIds = new Set(PATTERN_VARIANTS[type].map((variant) => variant.id));
  const rawVariant =
    typeof raw.variant === "string" ? raw.variant : DEFAULT_PATTERN_SETTINGS.variant;
  const strokeStyle =
    typeof raw.strokeStyle === "string" && strokeStyles.has(raw.strokeStyle as StrokeStyle)
      ? (raw.strokeStyle as StrokeStyle)
      : DEFAULT_PATTERN_SETTINGS.strokeStyle;

  return {
    id: typeof raw.id === "string" ? raw.id : undefined,
    name: typeof raw.name === "string" ? raw.name : undefined,
    type,
    repetitions: Math.round(clamp(finiteNumber(raw.repetitions, 12), 3, 100)),
    symmetry: Math.round(clamp(finiteNumber(raw.symmetry, 6), 1, 32)),
    density: clamp(finiteNumber(raw.density, 0.6), 0.05, 1),
    strokeWidth: clamp(finiteNumber(raw.strokeWidth, 2), 0.5, 10),
    spacing: clamp(finiteNumber(raw.spacing, 0.25), 0, 1),
    rotation: clamp(finiteNumber(raw.rotation, 0), 0, 360),
    scale: clamp(finiteNumber(raw.scale, 1), 0.4, 2),
    complexity: Math.round(clamp(finiteNumber(raw.complexity, 4), 1, 10)),
    variant: variantIds.has(rawVariant) ? rawVariant : getDefaultVariant(type),
    variation: clamp(finiteNumber(raw.variation, DEFAULT_PATTERN_SETTINGS.variation), 0, 1),
    phase: clamp(finiteNumber(raw.phase, DEFAULT_PATTERN_SETTINGS.phase), 0, 360),
    strokeStyle,
    seed: Math.round(clamp(finiteNumber(raw.seed, 120), 1, 9999)),
    canvasSize: Math.round(clamp(finiteNumber(raw.canvasSize, 800), 500, 1000)),
    inverted: typeof raw.inverted === "boolean" ? raw.inverted : DEFAULT_PATTERN_SETTINGS.inverted,
  };
}
