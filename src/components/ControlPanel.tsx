import React, { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronRight,
  CircleDot,
  Flower2,
  Grid3X3,
  Hexagon,
  Landmark,
  Mountain,
  Orbit,
  Radar,
  RefreshCw,
  Rows3,
  Save,
  Shapes,
  Shield,
  Sliders,
  Snowflake,
  Sparkles,
  Trash2,
  ToggleLeft,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";
import { PatternSettings, PatternType, Preset, StrokeStyle } from "../types";
import {
  PATTERN_TYPE_OPTIONS,
  PatternSliderOption,
  STROKE_STYLE_OPTIONS,
  getPatternControlProfile,
  getPatternDefaultSettings,
  getPatternVariantOptions,
} from "../settings";

interface ControlPanelProps {
  settings: PatternSettings;
  onChange: (updated: Partial<PatternSettings>) => void;
  onReset: () => void;
  onRandomize: () => void;
  onSavePreset: (name: string) => void;
  presets: Preset[];
  userPresets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const PATTERN_ICONS: Record<PatternType, LucideIcon> = {
  topography: Mountain,
  rosace: Flower2,
  mandala: CircleDot,
  fractal: Snowflake,
  tessellation: Grid3X3,
  grid: Shapes,
  radial: Radar,
  symmetry: Shield,
  generative: Orbit,
  guilloche: Landmark,
  woven: Rows3,
  lattice: Hexagon,
};

function SliderControl({ label, value, display, min, max, step, onChange }: SliderControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center gap-3 text-xs font-medium">
        <span className="text-gray-700 truncate">{label}</span>
        <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm shrink-0">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div>
  );
}

function formatSliderValue(value: number, mode: PatternSliderOption["display"]): string {
  if (mode === "percent") return `${(value * 100).toFixed(0)}%`;
  if (mode === "fixed2") return value.toFixed(2);
  if (mode === "degrees") return `${value}°`;
  if (mode === "scale") return `x${value.toFixed(1)}`;
  if (mode === "pixels") return `${value.toFixed(1)} px`;
  return `${Math.round(value)}`;
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h4 className="font-display font-semibold text-[11px] uppercase tracking-wider text-gray-500">
        {title}
      </h4>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function ControlPanel({
  settings,
  onChange,
  onReset,
  onRandomize,
  onSavePreset,
  presets,
  userPresets,
  onLoadPreset,
  onDeletePreset,
}: ControlPanelProps) {
  const [newPresetName, setNewPresetName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const variantOptions = useMemo(() => getPatternVariantOptions(settings.type), [settings.type]);
  const controlProfile = useMemo(() => getPatternControlProfile(settings.type), [settings.type]);

  const handleSliderChange = (key: keyof PatternSettings, value: number) => {
    onChange({ [key]: value });
  };

  const handlePatternChange = (type: PatternType) => {
    onChange(getPatternDefaultSettings(type, settings));
  };

  const handleStrokeStyleChange = (strokeStyle: StrokeStyle) => {
    onChange({ strokeStyle });
  };

  const handleCreatePreset = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName("");
    setShowSaveForm(false);
  };

  const renderSlider = (option: PatternSliderOption) => (
    <SliderControl
      key={option.key}
      label={option.label}
      value={settings[option.key]}
      display={formatSliderValue(settings[option.key], option.display)}
      min={option.min}
      max={option.max}
      step={option.step}
      onChange={(value) => handleSliderChange(option.key, value)}
    />
  );

  return (
    <div className="flex flex-col gap-5 select-none pb-12">
      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Shapes size={18} className="text-black shrink-0" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800 truncate">
              Pattern Palette
            </h3>
          </div>
          <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm shrink-0">
            {PATTERN_TYPE_OPTIONS.length} Algorithms
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {PATTERN_TYPE_OPTIONS.map((item) => {
            const Icon = PATTERN_ICONS[item.type];
            const isSelected = settings.type === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handlePatternChange(item.type)}
                title={`${item.label}: ${item.desc}`}
                aria-label={item.label}
                className={`aspect-square rounded-lg border flex items-center justify-center transition-smooth ${
                  isSelected
                    ? "border-black bg-black text-white shadow-sm"
                    : "border-gray-200 bg-gray-50/40 text-gray-600 hover:border-gray-400 hover:bg-white hover:text-black"
                }`}
              >
                <Icon size={18} strokeWidth={isSelected ? 2.4 : 1.8} />
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Variant
            </span>
            <select
              value={settings.variant}
              onChange={(event) => onChange({ variant: event.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white transition-smooth"
            >
              {variantOptions.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>

          <div className="text-right sm:min-w-28">
            <span className="block text-[10px] uppercase tracking-wider text-gray-400">Active</span>
            <span className="block text-xs font-semibold text-gray-900 truncate">
              {PATTERN_TYPE_OPTIONS.find((item) => item.type === settings.type)?.label}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={18} className="text-black shrink-0" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800 truncate">
              Seed Pool
            </h3>
          </div>
          <button
            type="button"
            onClick={onRandomize}
            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-smooth flex items-center gap-1.5 text-xs font-medium shrink-0"
          >
            <RefreshCw size={14} />
            <span>Randomize</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={settings.seed}
            onChange={(event) => onChange({ seed: Math.max(1, parseInt(event.target.value) || 1) })}
            className="flex-1 min-w-0 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm focus:outline-hidden focus:border-black focus:bg-white transition-smooth"
            placeholder="Seed number"
          />
          <button
            type="button"
            onClick={onRandomize}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-xs tracking-wider uppercase transition-smooth shrink-0"
          >
            Regen
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-50 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders size={18} className="text-black shrink-0" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800 truncate">
              Drawing Parameters
            </h3>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-black underline transition-smooth shrink-0"
          >
            Reset
          </button>
        </div>

        {controlProfile.structure.length > 0 && (
          <PanelSection title="Structure">
            {controlProfile.structure.map(renderSlider)}
          </PanelSection>
        )}

        {controlProfile.form.length > 0 && (
          <PanelSection title="Form">{controlProfile.form.map(renderSlider)}</PanelSection>
        )}

        <PanelSection title="Stroke">
          {controlProfile.stroke.map(renderSlider)}

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
            {STROKE_STYLE_OPTIONS.map((style) => {
              const isSelected = settings.strokeStyle === style.value;
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => handleStrokeStyleChange(style.value)}
                  className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-smooth ${
                    isSelected
                      ? "bg-white text-black shadow-xs"
                      : "text-gray-500 hover:text-black hover:bg-white/70"
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-gray-800">Invert Canvas Theme</span>
              <span className="text-[10px] text-gray-400 truncate">
                {settings.inverted
                  ? "Light strokes on dark background"
                  : "Dark strokes on light background"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onChange({ inverted: !settings.inverted })}
              className="text-gray-600 hover:text-black transition-smooth shrink-0"
            >
              {settings.inverted ? (
                <div className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-800">
                  <span>Dark</span>
                  <ToggleRight size={18} className="text-emerald-400" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200">
                  <span>Light</span>
                  <ToggleLeft size={18} />
                </div>
              )}
            </button>
          </div>
        </PanelSection>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-black" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800">
              Design Presets
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset)}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-black hover:bg-gray-50/50 text-left transition-smooth"
            >
              <div className="flex flex-col pr-2 min-w-0">
                <span className="font-medium text-xs text-gray-900 group-hover:text-black truncate">
                  {preset.name}
                </span>
                <span className="text-[9px] text-gray-400 leading-tight line-clamp-2">
                  {preset.description}
                </span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-black transition-smooth shrink-0"
              />
            </button>
          ))}
        </div>

        <div className="mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3.5 gap-3">
            <span className="font-medium text-xs text-gray-700">My Custom Presets</span>
            <button
              type="button"
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="text-xs text-black border-b border-black font-semibold hover:border-transparent transition-smooth pb-0.5 shrink-0"
            >
              {showSaveForm ? "Cancel" : "+ Save Preset"}
            </button>
          </div>

          {showSaveForm && (
            <form
              onSubmit={handleCreatePreset}
              className="flex gap-2 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100"
            >
              <input
                type="text"
                required
                value={newPresetName}
                onChange={(event) => setNewPresetName(event.target.value)}
                placeholder="My custom design name"
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-black"
              />
              <button
                type="submit"
                className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg flex items-center gap-1.5 font-medium text-xs transition-smooth shrink-0"
              >
                <Save size={12} />
                Save
              </button>
            </form>
          )}

          {userPresets.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic py-2 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-150">
              No custom design presets saved locally yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {userPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50/30 border border-gray-100 text-xs hover:border-gray-300 transition-smooth group"
                >
                  <button
                    type="button"
                    onClick={() => onLoadPreset(preset)}
                    className="flex-1 min-w-0 font-medium text-gray-700 text-left hover:text-black truncate"
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePreset(preset.id)}
                    className="p-1 text-gray-300 hover:text-rose-600 transition-smooth rounded-md opacity-0 group-hover:opacity-100 flex items-center"
                    title="Delete preset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
