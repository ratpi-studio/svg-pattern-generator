import { describe, expect, it } from "vite-plus/test";
import {
  DEFAULT_PATTERN_SETTINGS,
  PATTERN_TYPE_OPTIONS,
  getPatternControlProfile,
  normalizePatternSettings,
} from "./settings";
import { createShareUrl, encodeSettingsParam, settingsFromSearch } from "./shareState";

describe("shareState", () => {
  it("round-trips normalized settings through a URL-safe parameter", () => {
    const settings = normalizePatternSettings({
      ...DEFAULT_PATTERN_SETTINGS,
      type: "guilloche",
      variant: "medallion",
      repetitions: 44,
      symmetry: 14,
      seed: 609,
      inverted: true,
    });
    const encoded = encodeSettingsParam(settings);

    expect(settingsFromSearch(`?settings=${encoded}`)).toEqual(settings);
  });

  it("creates a URL that can restore the current pattern settings", () => {
    const settings = normalizePatternSettings({
      ...DEFAULT_PATTERN_SETTINGS,
      type: "woven",
      variant: "basket",
      seed: 311,
    });
    const url = createShareUrl(settings, "https://example.com/app?foo=bar");
    const restored = settingsFromSearch(new URL(url).search);

    expect(url).toContain("foo=bar");
    expect(restored).toEqual(settings);
  });
});

describe("pattern control profiles", () => {
  it("defines at least one visible control for every pattern family", () => {
    PATTERN_TYPE_OPTIONS.forEach(({ type }) => {
      const profile = getPatternControlProfile(type);
      expect([...profile.structure, ...profile.form, ...profile.stroke].length).toBeGreaterThan(0);
    });
  });
});
