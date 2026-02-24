import {
  Activity,
  AlertCircle,
  Box,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Globe,
  HardDrive,
  Radio,
  Server,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { NodeKind, SystemEdge, SystemNode } from "@/data/types";
import { useLayerStore } from "@/stores/layer-store";

function tracingStatusBg(status: string): string {
  if (status === "error") {
    return "oklch(0.65 0.25 15 / 0.15)";
  }
  if (status === "ok") {
    return "oklch(0.75 0.14 145 / 0.15)";
  }
  return "oklch(0.75 0.18 55 / 0.15)";
}

function tracingStatusFg(status: string): string {
  if (status === "error") {
    return "oklch(0.65 0.25 15)";
  }
  if (status === "ok") {
    return "oklch(0.75 0.14 145)";
  }
  return "oklch(0.75 0.18 55)";
}

function healthClass(health: string): string {
  if (health === "healthy") {
    return "text-emerald-400";
  }
  if (health === "critical") {
    return "text-red-400";
  }
  return "text-amber-400";
}

function metricBarClass(value: number): string {
  if (value > 80) {
    return "bg-red-400";
  }
  if (value > 60) {
    return "bg-amber-400";
  }
  return "bg-emerald-400";
}

function featureDotClass(status: string): string {
  if (status === "healthy") {
    return "bg-emerald-400";
  }
  if (status === "critical") {
    return "bg-red-400";
  }
  return "bg-amber-400";
}

const kindConfig: Record<
  NodeKind,
  { icon: React.ElementType; accent: string }
> = {
  gateway: { icon: Globe, accent: "oklch(0.78 0.15 200)" },
  service: { icon: Server, accent: "oklch(0.78 0.12 260)" },
  database: { icon: Database, accent: "oklch(0.75 0.14 145)" },
  queue: { icon: Radio, accent: "oklch(0.75 0.15 55)" },
  cache: { icon: HardDrive, accent: "oklch(0.70 0.18 330)" },
};

// Card dimensions (approximated for hero transition geometry).
const CARD_W = 300;
const CARD_H_APPROX = 280;

interface FocusModeOverlayProps {
  allEdges: SystemEdge[];
  allNodes: SystemNode[];
  nodeId: string;
  onExit: () => void;
}

export function FocusModeOverlay({
  nodeId,
  allNodes,
  allEdges: _allEdges,
  onExit,
}: FocusModeOverlayProps) {
  const activeLayer = useLayerStore((s) => s.activeLayer);

  // Capture at mount time — persists through exit animation even if store clears.
  const [capturedRect] = useState(
    () => useLayerStore.getState().focusModeInitialRect
  );

  const node = allNodes.find((n) => n.id === nodeId);
  if (!node) {
    return null;
  }

  const data = node.data;
  const cfg = kindConfig[data.kind] ?? kindConfig.service;
  const { icon: Icon, accent } = cfg;
  const accentTint = accent.replace(")", " / 0.12)");
  const accentBorder = accent.replace(")", " / 0.25)");
  const accentGlow = accent.replace(")", " / 0.1)");

  // Card screen geometry.
  const cardX = (window.innerWidth - CARD_W) / 2;
  const cardY = window.innerHeight / 2 - CARD_H_APPROX / 2;

  // Hero transition: scale-from-origin toward the node's screen position.
  let transformOrigin = "center center";
  let initScaleX = 0.95;
  let initScaleY = 0.95;

  if (capturedRect) {
    const originX = capturedRect.x + capturedRect.w / 2 - cardX;
    const originY = capturedRect.y + capturedRect.h / 2 - cardY;
    initScaleX = capturedRect.w / CARD_W;
    initScaleY = capturedRect.h / CARD_H_APPROX;
    transformOrigin = `${originX}px ${originY}px`;
  }

  const tracing = data.tracing;
  const platform = data.platform;
  const building = data.building;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Faint backdrop — canvas and scattered nodes remain visible */}
      <motion.div
        animate={{ opacity: 1 }}
        className="pointer-events-auto absolute inset-0"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onExit}
        style={{ background: "oklch(0.07 0.01 240 / 0.42)" }}
        transition={{ duration: 0.25 }}
      />

      {/* Enlarged node card — same visual language as SystemNodeComponent */}
      <motion.div
        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
        className="pointer-events-auto absolute"
        exit={{ opacity: 0, scaleX: initScaleX, scaleY: initScaleY }}
        initial={{ opacity: 0, scaleX: initScaleX, scaleY: initScaleY }}
        style={{
          left: cardX,
          top: cardY,
          width: CARD_W,
          transformOrigin,
        }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div
          className="relative overflow-hidden rounded-lg border bg-card/90 backdrop-blur-sm"
          style={{
            borderColor: accentBorder,
            boxShadow: [
              `0 0 0 1px ${accentGlow}`,
              "0 24px 64px oklch(0 0 0 / 0.6)",
              "inset 0 1px 0 oklch(1 0 0 / 0.04)",
            ].join(", "),
          }}
        >
          {/* Left accent stripe */}
          <div
            className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full"
            style={{ background: accent }}
          />

          {/* Close button */}
          <button
            className="absolute top-2.5 right-2.5 z-10 rounded p-1 text-white/25 transition-colors hover:bg-white/5 hover:text-white/60"
            onClick={onExit}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="px-4 py-3 pl-5">
            {/* Header: icon + label + kind badge */}
            <div className="flex items-start gap-2.5">
              <div
                className="mt-0.5 shrink-0 rounded p-1.5"
                style={{ background: accentTint }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0 flex-1 pr-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="font-semibold text-[15px] leading-tight">
                    {data.label}
                  </h2>
                  <span
                    className="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[8px] uppercase tracking-widest"
                    style={{
                      background: accentTint,
                      color: accent,
                      border: `1px solid ${accentBorder}`,
                    }}
                  >
                    {data.kind}
                  </span>
                </div>
                {data.team && (
                  <span
                    className="font-mono text-[9px] leading-none"
                    style={{ color: `${data.team.color}99` }}
                  >
                    {data.team.name}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                {data.description}
              </p>
            )}

            {/* Tracing layer */}
            {activeLayer === "tracing" && tracing && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[11px] text-foreground/70">
                      {tracing.latencyMs}ms
                    </span>
                  </div>
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
                    style={{
                      background: tracingStatusBg(tracing.status),
                      color: tracingStatusFg(tracing.status),
                    }}
                  >
                    {tracing.status}
                  </span>
                </div>
                {tracing.errorMessage && (
                  <p className="rounded border border-red-500/10 bg-red-500/5 px-2 py-1 font-mono text-[10px] text-red-400/80 leading-tight">
                    {tracing.errorMessage}
                  </p>
                )}
              </div>
            )}

            {/* Platform layer */}
            {activeLayer === "platform" && platform && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <div
                    className={`flex items-center gap-1 ${healthClass(platform.health)}`}
                  >
                    {platform.health === "healthy" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {platform.health === "critical" && (
                      <XCircle className="h-3 w-3" />
                    )}
                    {platform.health !== "healthy" &&
                      platform.health !== "critical" && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                    <span className="font-medium capitalize">
                      {platform.health}
                    </span>
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {platform.version}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-7 shrink-0 font-mono text-muted-foreground">
                    CPU
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${metricBarClass(platform.cpu)}`}
                      style={{ width: `${Math.min(platform.cpu, 100)}%` }}
                    />
                  </div>
                  <span className="w-7 text-right font-mono text-foreground/70">
                    {platform.cpu}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-7 shrink-0 font-mono text-muted-foreground">
                    MEM
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${metricBarClass(platform.memory)}`}
                      style={{ width: `${Math.min(platform.memory, 100)}%` }}
                    />
                  </div>
                  <span className="w-7 text-right font-mono text-foreground/70">
                    {platform.memory}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    <span className="font-mono">
                      {platform.pods.ready}/{platform.pods.total} pods
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span className="font-mono">{platform.lastDeploy}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Building layer */}
            {activeLayer === "building" && building && (
              <div className="mt-3 space-y-1">
                {building.ticketId && (
                  <div className="flex items-center gap-1.5 text-[10px] text-layer-building/70">
                    <FileText className="h-3 w-3" />
                    <span className="font-mono">{building.ticketId}</span>
                  </div>
                )}
                {building.proposedBy && (
                  <p className="text-[10px] text-muted-foreground">
                    Proposed by {building.proposedBy}
                  </p>
                )}
              </div>
            )}

            {/* Features grid */}
            {data.features && data.features.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-1 border-border/25 border-t pt-3">
                {data.features.map((f) => (
                  <div
                    className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1.5 ring-1 ring-white/[0.06]"
                    key={f.id}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${featureDotClass(f.status)}`}
                    />
                    <span className="min-w-0 truncate font-mono text-[10px] text-foreground/70 leading-none">
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
