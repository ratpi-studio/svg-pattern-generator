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
  | "topography"; // Organic waves, topographic contours, wood grain and river flow lines

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
