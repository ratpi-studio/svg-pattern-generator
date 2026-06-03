import { PatternSettings, PatternType, StrokeStyle } from "./types";

export interface PatternVariantOption {
  id: string;
  label: string;
}

export type NumericPatternSettingKey =
  | "repetitions"
  | "symmetry"
  | "density"
  | "strokeWidth"
  | "spacing"
  | "rotation"
  | "scale"
  | "complexity"
  | "variation"
  | "phase";

export type SliderDisplayMode = "integer" | "percent" | "fixed2" | "degrees" | "scale" | "pixels";

export interface PatternSliderOption {
  key: NumericPatternSettingKey;
  label: string;
  min: number;
  max: number;
  step: number;
  display: SliderDisplayMode;
}

export interface PatternControlProfile {
  defaults: Partial<PatternSettings>;
  structure: PatternSliderOption[];
  form: PatternSliderOption[];
  stroke: PatternSliderOption[];
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

const slider = (
  key: NumericPatternSettingKey,
  label: string,
  min: number,
  max: number,
  step: number,
  display: SliderDisplayMode,
): PatternSliderOption => ({ key, label, min, max, step, display });

const strokeControls = [
  slider("strokeWidth", "Stroke Width", 0.5, 10, 0.1, "pixels"),
] satisfies PatternSliderOption[];

const phaseRotationScale = [
  slider("phase", "Phase", 0, 360, 1, "degrees"),
  slider("rotation", "Rotation", 0, 360, 5, "degrees"),
  slider("scale", "Scale", 0.4, 2, 0.05, "scale"),
] satisfies PatternSliderOption[];

export const PATTERN_CONTROL_PROFILES: Record<PatternType, PatternControlProfile> = {
  topography: {
    defaults: { repetitions: 44, symmetry: 4, density: 0.6, spacing: 0.36, complexity: 6 },
    structure: [
      slider("repetitions", "Contour / Stream Count", 12, 80, 1, "integer"),
      slider("symmetry", "Flow Mode Bias", 1, 12, 1, "integer"),
      slider("complexity", "Field Attractors", 2, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Relief Density", 0.15, 1, 0.05, "percent"),
      slider("spacing", "Field Spacing", 0, 1, 0.02, "fixed2"),
      slider("variation", "Organic Distortion", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  rosace: {
    defaults: DEFAULT_PATTERN_SETTINGS,
    structure: [
      slider("repetitions", "Petal Count", 3, 48, 1, "integer"),
      slider("symmetry", "Support Axes", 3, 24, 1, "integer"),
      slider("complexity", "Nested Rings", 1, 8, 1, "integer"),
    ],
    form: [
      slider("density", "Overlap Density", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Petal Offset", 0, 1, 0.02, "fixed2"),
      slider("variation", "Ring Drift", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  mandala: {
    defaults: { repetitions: 18, symmetry: 12, density: 0.52, spacing: 0.24, complexity: 6 },
    structure: [
      slider("symmetry", "Petal Sectors", 4, 32, 1, "integer"),
      slider("complexity", "Ring Layers", 2, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Detail Density", 0.15, 1, 0.05, "percent"),
      slider("spacing", "Petal Spread", 0, 1, 0.02, "fixed2"),
      slider("variation", "Layer Drift", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  fractal: {
    defaults: { repetitions: 8, symmetry: 6, density: 0.56, spacing: 0.34, complexity: 5 },
    structure: [
      slider("symmetry", "Radial Arms", 3, 18, 1, "integer"),
      slider("complexity", "Branch Depth", 2, 7, 1, "integer"),
    ],
    form: [
      slider("density", "Branch Density", 0.15, 1, 0.05, "percent"),
      slider("spacing", "Fork Angle", 0, 1, 0.02, "fixed2"),
      slider("variation", "Branch Jitter", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  tessellation: {
    defaults: { repetitions: 24, symmetry: 4, density: 0.5, spacing: 0.42, complexity: 4 },
    structure: [slider("complexity", "Tile Motif Levels", 1, 8, 1, "integer")],
    form: [
      slider("density", "Tile Fill Density", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Tile Size", 0, 1, 0.02, "fixed2"),
      slider("variation", "Tile Alternation", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  grid: {
    defaults: { repetitions: 20, symmetry: 8, density: 0.62, spacing: 0.3, complexity: 5 },
    structure: [
      slider("symmetry", "Radial Guides", 4, 32, 1, "integer"),
      slider("complexity", "Guide Connections", 1, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Grid Resolution", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Draft Offset", 0, 1, 0.02, "fixed2"),
      slider("variation", "Line Drift", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  radial: {
    defaults: { repetitions: 34, symmetry: 10, density: 0.68, spacing: 0.48, complexity: 6 },
    structure: [
      slider("repetitions", "Rays / Spiral Arms", 8, 80, 1, "integer"),
      slider("complexity", "Coil Detail", 1, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Moiré Density", 0.05, 1, 0.05, "percent"),
      slider("spacing", "Interference Offset", 0, 1, 0.02, "fixed2"),
      slider("variation", "Radius Wobble", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  symmetry: {
    defaults: { repetitions: 8, symmetry: 8, density: 0.72, spacing: 0.16, complexity: 6 },
    structure: [
      slider("symmetry", "Mirror Sectors", 3, 32, 1, "integer"),
      slider("complexity", "Polygon Nodes", 2, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Seal Fill", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Sector Spread", 0, 1, 0.02, "fixed2"),
      slider("variation", "Node Randomness", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  generative: {
    defaults: { repetitions: 40, symmetry: 7, density: 0.46, spacing: 0.7, complexity: 7 },
    structure: [
      slider("symmetry", "Gear Ratio", 3, 16, 1, "integer"),
      slider("complexity", "Curve Resolution", 2, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Inner Gear Size", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Pen Offset", 0, 1, 0.02, "fixed2"),
      slider("variation", "Orbit Breathing", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  guilloche: {
    defaults: { repetitions: 44, symmetry: 14, density: 0.58, spacing: 0.34, complexity: 7 },
    structure: [
      slider("repetitions", "Curve Resolution", 12, 100, 1, "integer"),
      slider("symmetry", "Lobe Families", 4, 32, 1, "integer"),
      slider("complexity", "Engraving Layers", 3, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Wave Amplitude", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Ribbon Offset", 0, 1, 0.02, "fixed2"),
      slider("variation", "Epicycle Drift", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  woven: {
    defaults: { repetitions: 34, symmetry: 8, density: 0.72, spacing: 0.38, complexity: 5 },
    structure: [
      slider("repetitions", "Band Count Bias", 5, 80, 1, "integer"),
      slider("complexity", "Diagonal Detail", 1, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Weave Density", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Band Thickness", 0, 1, 0.02, "fixed2"),
      slider("variation", "Thread Wave", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
  lattice: {
    defaults: { repetitions: 26, symmetry: 10, density: 0.64, spacing: 0.32, complexity: 6 },
    structure: [
      slider("symmetry", "Star Vertices", 5, 24, 1, "integer"),
      slider("complexity", "Crystal Detail", 1, 10, 1, "integer"),
    ],
    form: [
      slider("density", "Node Density", 0.1, 1, 0.05, "percent"),
      slider("spacing", "Cell Size", 0, 1, 0.02, "fixed2"),
      slider("variation", "Node Jitter", 0, 1, 0.01, "percent"),
      ...phaseRotationScale,
    ],
    stroke: strokeControls,
  },
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

export const getPatternControlProfile = (type: PatternType): PatternControlProfile =>
  PATTERN_CONTROL_PROFILES[type];

export const getPatternDefaultSettings = (
  type: PatternType,
  carry: Partial<PatternSettings> = {},
): PatternSettings =>
  normalizePatternSettings({
    ...DEFAULT_PATTERN_SETTINGS,
    ...PATTERN_CONTROL_PROFILES[type].defaults,
    type,
    variant: getDefaultVariant(type),
    seed: carry.seed ?? DEFAULT_PATTERN_SETTINGS.seed,
    strokeStyle: carry.strokeStyle ?? DEFAULT_PATTERN_SETTINGS.strokeStyle,
    inverted: carry.inverted ?? DEFAULT_PATTERN_SETTINGS.inverted,
  });
