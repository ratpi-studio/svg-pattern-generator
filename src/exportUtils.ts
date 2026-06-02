/**
 * Utilities for copying and exporting SVG pattern vectors
 */

const SVG_COLOR_PATTERN = "#[0-9a-fA-F]{3,8}|rgba?\\([^)]*\\)|white|black";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const detectBackgroundFill = (svgString: string): string => {
  const backgroundRectMatch = svgString.match(
    new RegExp(
      `<rect\\b(?=[^>]*\\bwidth="[^"]+")(?=[^>]*\\bheight="[^"]+")(?=[^>]*\\bfill="(${SVG_COLOR_PATTERN})")[^>]*>`,
      "i",
    ),
  );
  if (backgroundRectMatch?.[1]) return backgroundRectMatch[1];

  const styleBackgroundMatch = svgString.match(
    new RegExp(`background-color:\\s*(${SVG_COLOR_PATTERN})`, "i"),
  );
  return styleBackgroundMatch?.[1] ?? "#ffffff";
};

/**
 * Produces a download-oriented SVG: the canvas/background color becomes transparent
 * and the remaining vector elements are exported fully opaque.
 */
export function prepareSvgForTransparentExport(svgString: string): string {
  const backgroundFill = detectBackgroundFill(svgString);
  const backgroundColor = escapeRegExp(backgroundFill);
  const backgroundFillMatcher = new RegExp(`fill="${backgroundColor}"`, "gi");

  return svgString
    .replace(new RegExp(`background-color:\\s*${backgroundColor};?\\s*`, "gi"), "")
    .replace(backgroundFillMatcher, 'fill="none"')
    .replace(/\s(?:opacity|fill-opacity|stroke-opacity)="[^"]*"/g, "");
}

/**
 * Copies the SVG string directly to the user's clipboard
 */
export async function copyToClipboard(svgString: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}

/**
 * Automatically triggers an file download for the SVG code
 */
export function downloadSVG(svgString: string, filename: string = "motif-svg"): void {
  try {
    const exportSvg = prepareSvgForTransparentExport(svgString);
    const blob = new Blob([exportSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error triggered during SVG download:", err);
  }
}

/**
 * Renders the SVG into an offscreen canvas and triggers a download as PNG
 */
export function downloadPNG(
  svgString: string,
  canvasSize: number,
  filename: string = "motif-svg",
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      // Safe cross-origin configuration
      img.crossOrigin = "anonymous";

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Create an offscreen canvas in high fidelity
        const canvas = document.createElement("canvas");
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }

        // Fill background first in matching color
        const isInverted =
          svgString.includes("background-color: #000000") || svgString.includes('fill="#000000"');
        ctx.fillStyle = isInverted ? "#000000" : "#ffffff";
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Draw the vector image
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

        // Convert to data uri and trigger anchor download
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
          resolve(true);
        } catch (canvasErr) {
          console.error("Failed to serialize canvas data:", canvasErr);
          URL.revokeObjectURL(url);
          resolve(false);
        }
      };

      img.onerror = (err) => {
        console.error("Error during image loading:", err);
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    } catch (err) {
      console.error("Failed to initialize PNG export:", err);
      resolve(false);
    }
  });
}
