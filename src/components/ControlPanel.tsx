import React, { useState } from "react";
import {
  Sliders,
  Sparkles,
  RefreshCw,
  Save,
  Trash2,
  Bookmark,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Shapes,
} from "lucide-react";
import { PatternSettings, PatternType, Preset } from "../types";

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

  // High-fidelity pattern types catalog
  const PATTERN_TYPES: { type: PatternType; label: string; desc: string; icon: string }[] = [
    { type: "topography", label: "Topography", desc: "Contour curves & organic flows", icon: "〰️" },
    { type: "rosace", label: "Rosette", desc: "Interlacing loops & petal contours", icon: "❂" },
    { type: "mandala", label: "Mandala", desc: "Harmonic concentric crowns", icon: "💮" },
    { type: "fractal", label: "Fractal", desc: "Symmetric branching snowflakes", icon: "❄️" },
    {
      type: "tessellation",
      label: "Tessellation",
      desc: "Infinite repeating modular patterns",
      icon: "⚃",
    },
    { type: "grid", label: "Grid", desc: "Blueprint & engineering drafting", icon: "⌗" },
    { type: "radial", label: "Radial", desc: "Emanating lines & optic moirés", icon: "☼" },
    { type: "symmetry", label: "Symmetry", desc: "Symmetric runes & heraldic shields", icon: "🌟" },
    { type: "generative", label: "Spirograph", desc: "Orbits & solar harmonics", icon: "🌀" },
  ];

  const handleSliderChange = (key: keyof PatternSettings, value: number) => {
    onChange({ [key]: value });
  };

  const handleToggleSwap = () => {
    onChange({ inverted: !settings.inverted });
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName("");
    setShowSaveForm(false);
  };

  return (
    <div className="flex flex-col gap-6 select-none pb-12">
      {/* 1. SECTOR SELECTOR: THE CORE DESIGN ENGINE */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shapes size={18} className="text-black" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800">
              Pattern Style
            </h3>
          </div>
          <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm">
            9 Algorithms
          </span>
        </div>

        {/* Visual responsive grids */}
        <div className="grid grid-cols-2 gap-2.5">
          {PATTERN_TYPES.map((item) => {
            const isSelected = settings.type === item.type;
            return (
              <button
                key={item.type}
                onClick={() => onChange({ type: item.type })}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-smooth group relative overflow-hidden ${
                  isSelected
                    ? "border-black bg-black text-white shadow-sm"
                    : "border-gray-200/70 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center w-full justify-between mb-1.5">
                  <span className="text-lg">{item.icon}</span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white relative animate-ping" />
                  )}
                </div>
                <span className="font-semibold text-xs tracking-tight">{item.label}</span>
                <span
                  className={`text-[9px] mt-0.5 leading-tight ${isSelected ? "text-gray-300" : "text-gray-400 group-hover:text-gray-500"}`}
                >
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contextual instruction tooltips */}
        {settings.type === "topography" && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-2.5 text-[11px] text-gray-600 leading-relaxed shadow-3xs">
            <span className="text-lg select-none">💡</span>
            <div>
              <p className="font-semibold text-gray-950 mb-0.5">Organic Motif Tip:</p>
              <p>
                Set <strong>Symmetry</strong> to an{" "}
                <strong>Even number ({settings.symmetry % 2 === 0 ? "Active" : "Off"})</strong> to
                draw <strong className="text-black">nested closed loops and hills</strong>. Set to
                an <strong>Odd number ({settings.symmetry % 2 !== 0 ? "Active" : "Off"})</strong> to
                generate <strong className="text-black">flowing river stream waves</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC GENERATIVE SEED ROW */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-black" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800">
              Random Seed Pool
            </h3>
          </div>
          <button
            onClick={onRandomize}
            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-smooth flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw size={14} className="animate-spin duration-1000" />
            <span>Randomize</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={settings.seed}
            onChange={(e) => onChange({ seed: Math.max(1, parseInt(e.target.value) || 1) })}
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-hidden focus:border-black focus:bg-white transition-smooth"
            placeholder="Seed number"
          />
          <button
            onClick={onRandomize}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-medium text-xs tracking-wider uppercase transition-smooth"
          >
            Regen
          </button>
        </div>
      </div>

      {/* 3. CORE PARAMETRIC SLIDERS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-black" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800">
              Drawing Parameters
            </h3>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-black underline transition-smooth"
          >
            Reset
          </button>
        </div>

        {/* Sliders loop list */}
        <div className="flex flex-col gap-5">
          {/* REPETITIONS OR MULTIPLIER */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700 flex items-center gap-1">
                Repetitions / Branches
                <span className="text-[10px] text-gray-400 font-normal">
                  ({settings.type === "tessellation" ? "Size" : "Elements"})
                </span>
              </span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                {settings.repetitions}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={100}
              step={1}
              value={settings.repetitions}
              onChange={(e) => handleSliderChange("repetitions", parseInt(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* SYMMETRY AXES */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Symmetry Axes</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                x{settings.symmetry}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={32}
              step={1}
              value={settings.symmetry}
              onChange={(e) => handleSliderChange("symmetry", parseInt(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* DENSITY */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Pattern Density</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                {(settings.density * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={settings.density}
              onChange={(e) => handleSliderChange("density", parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* COMPLEXITY / LAYERS */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Layers / Complexity</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                Detail level: {settings.complexity}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.complexity}
              onChange={(e) => handleSliderChange("complexity", parseInt(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* STROKE WIDTH */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Stroke Width</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                {settings.strokeWidth} px
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10.0}
              step={0.1}
              value={settings.strokeWidth}
              onChange={(e) => handleSliderChange("strokeWidth", parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* SPACING */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Spacing / Offsets</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                {settings.spacing.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.02}
              value={settings.spacing}
              onChange={(e) => handleSliderChange("spacing", parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* ROTATION */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Global Rotation</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                {settings.rotation}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={settings.rotation}
              onChange={(e) => handleSliderChange("rotation", parseInt(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* SCALE */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-700">Zoom Scale</span>
              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                x{settings.scale.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={2.0}
              step={0.05}
              value={settings.scale}
              onChange={(e) => handleSliderChange("scale", parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>

        {/* INVERSION SWITCH */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-800">Invert Canvas Theme</span>
            <span className="text-[10px] text-gray-400">
              Light elements on dark (or vice versa)
            </span>
          </div>

          <button
            onClick={handleToggleSwap}
            className="text-gray-600 hover:text-black transition-smooth"
          >
            {settings.inverted ? (
              <div className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-800">
                <span>Light on Dark</span>
                <ToggleRight size={18} className="text-emerald-400" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200">
                <span>Dark on Light</span>
                <ToggleLeft size={18} />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 4. PRESETS EXPLORER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-black" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-800">
              Design Presets
            </h3>
          </div>
        </div>

        {/* Catalog mapping */}
        <div className="flex flex-col gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50/50 text-left transition-smooth"
            >
              <div className="flex flex-col pr-2">
                <span className="font-medium text-xs text-gray-900 group-hover:text-black">
                  {preset.name}
                </span>
                <span className="text-[9px] text-gray-400 leading-tight">{preset.description}</span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-black transition-smooth shrink-0"
              />
            </button>
          ))}
        </div>

        {/* CUSTOM PRESETS ZONE WITH SAVING ACTIONS */}
        <div className="mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3.5">
            <span className="font-medium text-xs text-gray-700">My Custom Presets</span>
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="text-xs text-black border-b border-black font-semibold hover:border-transparent transition-smooth pb-0.5"
            >
              {showSaveForm ? "Cancel" : "+ Save Preset"}
            </button>
          </div>

          {/* Save preset form collapsible */}
          {showSaveForm && (
            <form
              onSubmit={handleCreatePreset}
              className="flex gap-2 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100"
            >
              <input
                type="text"
                required
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My custom design name"
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-black"
              />
              <button
                type="submit"
                className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg flex items-center gap-1.5 font-medium text-xs transition-smooth shrink-0"
              >
                <Save size={12} />
                Save Preset
              </button>
            </form>
          )}

          {/* User saved presets list rendering */}
          {userPresets.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic py-2 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-150">
              No custom design presets saved locally yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {userPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50/30 border border-gray-100 text-xs hover:border-gray-300 transition-smooth group"
                >
                  <button
                    onClick={() => onLoadPreset(preset)}
                    className="flex-1 font-medium text-gray-700 text-left hover:text-black"
                  >
                    {preset.name}
                  </button>
                  <button
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
