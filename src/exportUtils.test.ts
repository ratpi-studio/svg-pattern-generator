import { describe, expect, it } from "vite-plus/test";
import { detectBackgroundFill, prepareSvgForTransparentExport } from "./exportUtils";

describe("prepareSvgForTransparentExport", () => {
  it("makes only the white canvas transparent and keeps vector styling intact", () => {
    const svg = `<svg style="background-color: #ffffff; transition: background-color 0.3s ease;">
  <rect width="800" height="800" fill="#ffffff" />
  <path d="M 0 0 L 10 10" fill="none" stroke="#000000" opacity="0.4" />
  <circle cx="4" cy="4" r="2" fill="#000000" opacity="0.25" />
  <circle cx="8" cy="8" r="2" fill="#ffffff" opacity="0.6" />
</svg>`;

    const exported = prepareSvgForTransparentExport(svg);

    expect(exported).not.toContain("background-color: #ffffff");
    expect(exported).toContain('<rect width="800" height="800" fill="none" />');
    expect(exported).toContain('<circle cx="8" cy="8" r="2" fill="#ffffff" opacity="0.6" />');
    expect(exported).toContain('opacity="0.4"');
    expect(exported).toContain('fill="none"');
    expect(exported).toContain('stroke="#000000"');
    expect(exported).toContain('fill="#000000"');
  });

  it("uses the current canvas fill as the transparent color for inverted SVGs", () => {
    const svg = `<svg style="background-color: #000000;">
  <rect width="800" height="800" fill="#000000" />
  <path d="M 0 0 L 10 10" fill="none" stroke="#ffffff" opacity="0.7" />
</svg>`;

    const exported = prepareSvgForTransparentExport(svg);

    expect(exported).not.toContain("background-color: #000000");
    expect(exported).toContain('<rect width="800" height="800" fill="none" />');
    expect(exported).toContain('opacity="0.7"');
    expect(exported).toContain('stroke="#ffffff"');
  });

  it("detects the background from the canvas rect before vector fills", () => {
    const svg = `<svg style="background-color: #ffffff;">
  <rect width="800" height="800" fill="#ffffff" />
  <circle cx="4" cy="4" r="2" fill="#000000" />
</svg>`;

    expect(detectBackgroundFill(svg)).toBe("#ffffff");
  });
});
