/**
 * Types and interfaces for the SVG Pattern Generator
 */

export type PatternType =
  | "rosace" // Rotational overlapping curves / petals
  | "mandala" // Concentric structural geometric rings
  | "fractal" // Symmetric branching trees or nested shapes
  | "tessellation" // Repeating grid patterns (Truchet / waves / links)
  | "grid" // Geometric blueprints & drafting technical grids
  | "radial" // Ray bursts, spirals & optical moiré patterns
  | "symmetry" // Multi-axis mirrored custom polygon paths
  | "generative" // Spirographs (hypotrochoids) & flow paths
  | "topography" // Organic waves, topographic contours, wood grain and river flow lines
  | "guilloche" // Security engraving rosettes, Lissajous curves and epicyclic loops
  | "woven" // Loom, Celtic and over-under interlaced bands
  | "lattice"; // Hexagonal, triangular, star and quasi-crystal networks

export type StrokeStyle = "solid" | "dashed" | "dotted";

export interface PatternSettings {
  id?: string;
  name?: string;
  type: PatternType;
  repetitions: number; // Primary multiplier/repetition count
  symmetry: number; // Mirrored axes/sectors
  density: number; // Density of lines / fills (0 to 1)
  strokeWidth: number; // Width of vectors (0.5 to 10)
  spacing: number; // Offset of sub-elements relative to center
  rotation: number; // Base rotation in degrees (0 to 360)
  scale: number; // Total visual zoom (0.1 to 3)
  complexity: number; // Visual levels/nested elements (1 to 10)
  variant: string; // Local algorithm variation, contextual to the selected type
  variation: number; // Jitter, noise or irregularity amount (0 to 1)
  phase: number; // Internal wave/rotation/moiré phase offset in degrees (0 to 360)
  strokeStyle: StrokeStyle; // Solid, dashed or dotted stroke rendering
  seed: number; // Seed value for generative reproducibility (1 to 9999)
  canvasSize: number; // Size of SVG coordinate system (500 to 1000)
  inverted: boolean; // White on Black vs Black on White
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  settings: PatternSettings;
}
