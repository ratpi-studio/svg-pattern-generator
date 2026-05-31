import { describe, expect, it } from "vite-plus/test";
import { PatternGenerator } from "./generator";
import {
  DEFAULT_PATTERN_SETTINGS,
  PATTERN_TYPE_OPTIONS,
  PATTERN_VARIANTS,
  normalizePatternSettings,
} from "./settings";
import { PatternSettings, PatternType } from "./types";

const allTypes = PATTERN_TYPE_OPTIONS.map((option) => option.type);

const makeSettings = (
  type: PatternType,
  overrides: Partial<PatternSettings> = {},
): PatternSettings =>
  normalizePatternSettings({
    ...DEFAULT_PATTERN_SETTINGS,
    type,
    variant: PATTERN_VARIANTS[type][0].id,
    repetitions: 22,
    symmetry: 8,
    density: 0.58,
    strokeWidth: 1.6,
    spacing: 0.36,
    complexity: 5,
    variation: 0.35,
    phase: 24,
    seed: 1234,
    canvasSize: 800,
    ...overrides,
  });

const expectValidSvg = (svg: string) => {
  expect(svg.trim().startsWith("<svg")).toBe(true);
  expect(svg.trim().endsWith("</svg>")).toBe(true);
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('id="pattern-svg-output"');
  expect(svg).not.toMatch(/\b(?:NaN|undefined|Infinity)\b/);
  expect(svg).not.toContain('cx="400" cy="400" r="100" fill="none"');
};

describe("PatternGenerator", () => {
  it.each(allTypes)("generates valid SVG for %s", (type) => {
    const svg = PatternGenerator.generate(makeSettings(type));
    expectValidSvg(svg);
  });

  it("is deterministic for identical settings and seed", () => {
    const settings = makeSettings("guilloche", {
      variant: "medallion",
      seed: 609,
      phase: 72,
      strokeStyle: "dashed",
    });

    expect(PatternGenerator.generate(settings)).toBe(PatternGenerator.generate(settings));
  });

  it.each<PatternType>([
    "fractal",
    "tessellation",
    "symmetry",
    "generative",
    "topography",
    "guilloche",
    "woven",
    "lattice",
  ])("changes seed-sensitive output for %s", (type) => {
    const first = PatternGenerator.generate(makeSettings(type, { seed: 101 }));
    const second = PatternGenerator.generate(makeSettings(type, { seed: 202 }));

    expect(first).not.toBe(second);
  });

  it.each(allTypes)("keeps advanced %s SVG output bounded", (type) => {
    const svg = PatternGenerator.generate(
      makeSettings(type, {
        repetitions: 72,
        symmetry: 16,
        density: 0.78,
        strokeWidth: 1.2,
        spacing: 0.55,
        complexity: 8,
        variation: 0.7,
        phase: 135,
        strokeStyle: "dotted",
        seed: 909,
      }),
    );

    expectValidSvg(svg);
    expect(svg.length).toBeLessThan(450_000);
  });
});
