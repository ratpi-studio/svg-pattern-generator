import React, { useState, useMemo } from "react";
import { Copy, Download, Code, Eye, Check } from "lucide-react";
import { PatternSettings } from "../types";
import { copyToClipboard, downloadSVG, downloadPNG } from "../exportUtils";

interface PatternPreviewProps {
  svgString: string;
  settings: PatternSettings;
  onShowNotification: (message: string) => void;
}

export default function PatternPreview({
  svgString,
  settings,
  onShowNotification,
}: PatternPreviewProps) {
  const [showCode, setShowCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [viewMode, setViewMode] = useState<"fit" | "actual">("fit");

  // Compute stats about the generated vector content (craftsmanship details)
  const vectorStats = useMemo(() => {
    const lines = (svgString.match(/<line/g) || []).length;
    const circles = (svgString.match(/<circle/g) || []).length;
    const paths = (svgString.match(/<path/g) || []).length;
    const ellipses = (svgString.match(/<ellipse/g) || []).length;
    const total = lines + circles + paths + ellipses;

    // Approximate file size in KB
    const bytes = new Blob([svgString]).size;
    const kb = (bytes / 1024).toFixed(1);

    return { lines, circles, paths, ellipses, total, kb };
  }, [svgString]);

  const handleCopy = async () => {
    const success = await copyToClipboard(svgString);
    if (success) {
      setIsCopied(true);
      onShowNotification("SVG Code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      onShowNotification("Copy failed.");
    }
  };

  const handleDownloadSVG = () => {
    const filename = `pattern-${settings.type}-${settings.seed}`;
    downloadSVG(svgString, filename);
    onShowNotification("Vector file (.svg) downloaded!");
  };

  const handleDownloadPNG = async () => {
    setIsExportingPng(true);
    const filename = `pattern-${settings.type}-${settings.seed}`;
    const success = await downloadPNG(svgString, settings.canvasSize, filename);
    setIsExportingPng(false);
    if (success) {
      onShowNotification("Image file (.png) downloaded!");
    } else {
      onShowNotification("Failed to generate PNG image.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Dynamic Header with View States */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          <h2 className="font-display font-semibold text-sm tracking-wide text-gray-800 uppercase">
            Preview Workspace
          </h2>
        </div>

        {/* Toggle View Options */}
        <div className="flex items-center gap-1.5 p-0.5 bg-gray-100 rounded-lg text-xs">
          <button
            onClick={() => setViewMode("fit")}
            className={`px-3 py-1.5 rounded-md font-medium transition-smooth ${
              viewMode === "fit"
                ? "bg-white text-black shadow-xs"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Fit to Screen
          </button>
          <button
            onClick={() => setViewMode("actual")}
            className={`px-3 py-1.5 rounded-md font-medium transition-smooth ${
              viewMode === "actual"
                ? "bg-white text-black shadow-xs"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Actual Size ({settings.canvasSize}px)
          </button>
        </div>
      </div>

      {/* Main Sandbox Interactive Playground Frame */}
      <div className="flex-1 relative min-h-[360px] md:min-h-[480px] bg-gray-50 flex items-center justify-center p-6 overflow-auto">
        {/* The SVG Container */}
        <div
          style={{
            width: viewMode === "fit" ? "100%" : `${settings.canvasSize}px`,
            maxWidth: viewMode === "fit" ? "540px" : "none",
            aspectRatio: "1/1",
          }}
          className={`relative rounded-xl overflow-hidden transition-all duration-300 border border-gray-200/50 ${
            settings.inverted ? "shadow-2xl shadow-black/20" : "shadow-md shadow-gray-200/50"
          }`}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />

        {/* Real-time floating vector stats badge (Architecture Honesty) */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 px-3 py-2 bg-black/85 backdrop-blur-md rounded-lg text-[10px] font-mono text-gray-400 select-none border border-white/10 shadow-lg pointer-events-none">
          <span className="text-white font-medium">VECTOR STATISTICS</span>
          <span>
            Total vectors: <strong className="text-white">{vectorStats.total}</strong>
          </span>
          <span>
            Paths (curves): <strong className="text-white">{vectorStats.paths}</strong>
          </span>
          <span>
            Circles & ellipses:{" "}
            <strong className="text-white">{vectorStats.circles + vectorStats.ellipses}</strong>
          </span>
          <span>
            Est. file size: <strong className="text-white">{vectorStats.kb} KB</strong>
          </span>
        </div>
      </div>

      {/* Code Drawer Component */}
      {showCode && (
        <div className="border-t border-gray-100 bg-gray-900 text-gray-100 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-800">
            <span className="text-gray-400 font-medium tracking-wider flex items-center gap-2">
              <Code size={14} className="text-white" /> VECTOR SVG SOURCE
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-md flex items-center gap-1.5 transition-smooth text-gray-300"
            >
              {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto overflow-x-auto whitespace-pre rounded bg-gray-950 p-2.5 text-gray-300 border border-gray-850">
            {svgString}
          </div>
        </div>
      )}

      {/* Footer controls layout */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Toggle markup viewer */}
        <button
          onClick={() => setShowCode(!showCode)}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-smooth ${
            showCode
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {showCode ? <Eye size={16} /> : <Code size={16} />}
          {showCode ? "Hide Code" : "Inspect Code"}
        </button>

        {/* Exporters action box */}
        <div className="w-full sm:w-auto flex flex-row gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl border border-gray-200 flex items-center justify-center gap-2 font-medium text-sm transition-smooth"
          >
            {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            <span>SVG Code</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl border border-gray-200 flex items-center justify-center gap-2 font-medium text-sm transition-smooth"
          >
            <Download size={16} />
            <span>Format .SVG</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={isExportingPng}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-smooth disabled:bg-gray-300 disabled:cursor-wait"
          >
            <Download size={16} />
            <span>{isExportingPng ? "Rendering..." : "Format .PNG"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
