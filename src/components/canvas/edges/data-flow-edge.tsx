import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { motion } from "motion/react";
import type { SystemEdgeData } from "@/data/types";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/stores/layer-store";

type SystemEdgeType = Edge<SystemEdgeData>;

function getTracingStroke(
  isError: boolean,
  isWarning: boolean,
  isTraceActive: boolean
): string {
  if (isError) {
    return "oklch(0.65 0.25 15)";
  }
  if (isWarning) {
    return "oklch(0.75 0.18 55)";
  }
  if (isTraceActive) {
    return "oklch(0.78 0.15 200)";
  }
  return "oklch(0.25 0.01 270)";
}

function getPlatformStroke(errorRate: number): string {
  if (errorRate > 10) {
    return "oklch(0.65 0.25 15)";
  }
  if (errorRate > 1) {
    return "oklch(0.75 0.18 55)";
  }
  return "oklch(0.50 0.08 165)";
}

function getErrorRateClass(errorRate: number): string {
  if (errorRate > 10) {
    return "text-red-400";
  }
  if (errorRate > 1) {
    return "text-amber-400";
  }
  return "text-emerald-400";
}

const FLOW_TRANSITION = { duration: 0.6, ease: [0.32, 0, 0.67, 0] as const };

function EdgeFlowIndicator({
  edgePath,
  strokeColor,
  isError,
  isTraceActive,
}: {
  edgePath: string;
  strokeColor: string;
  isError: boolean;
  isTraceActive: boolean;
}) {
  if (isError) {
    return (
      <motion.path
        animate={{ d: edgePath }}
        className="animate-[trace-flow_0.5s_linear_infinite]"
        fill="none"
        stroke="oklch(0.65 0.25 15)"
        strokeDasharray="4 8"
        strokeWidth={3}
        style={{ opacity: 0.4 }}
        transition={FLOW_TRANSITION}
      />
    );
  }
  if (isTraceActive) {
    return (
      <motion.path
        animate={{ d: edgePath }}
        className="animate-[trace-flow_1s_linear_infinite]"
        fill="none"
        stroke={strokeColor}
        strokeDasharray="6 6"
        strokeWidth={2}
        style={{ opacity: 0.6 }}
        transition={FLOW_TRANSITION}
      />
    );
  }
  return null;
}

function EdgeLabel({
  data,
  labelX,
  labelY,
  isError,
  isWarning,
  throughput,
}: {
  data: SystemEdgeData;
  labelX: number;
  labelY: number;
  isError: boolean;
  isWarning: boolean;
  throughput?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-all nodrag nopan edge-label absolute",
        "flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[9px]",
        "border border-border/50 bg-card/90 backdrop-blur-sm",
        "text-muted-foreground",
        isError && "border-layer-error/30 text-layer-error/80",
        isWarning && "border-layer-warning/30 text-layer-warning/80"
      )}
      style={{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
      }}
    >
      {data.label}
      {data.protocol && (
        <span className="text-[8px] opacity-60">{data.protocol}</span>
      )}
      {throughput && (
        <>
          <span className="opacity-30">·</span>
          <span className="text-layer-live opacity-80">{throughput}</span>
        </>
      )}
    </div>
  );
}

function EdgeMetrics({
  platform,
  labelX,
  labelY,
}: {
  platform: NonNullable<SystemEdgeData["platform"]>;
  labelX: number;
  labelY: number;
}) {
  const errorRate = platform.errorRate ?? 0;
  return (
    <div
      className="pointer-events-all nodrag nopan edge-label absolute rounded border border-border/40 bg-card/90 px-2 py-1 font-mono text-[9px] backdrop-blur-sm"
      style={{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
      }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{platform.requestsPerSec} rps</span>
        <span className={getErrorRateClass(errorRate)}>
          {platform.errorRate}% err
        </span>
        <span>p99: {platform.p99Latency}ms</span>
      </div>
    </div>
  );
}

function edgeOpacity(
  isFocusModeDimmed: boolean,
  dimmed: boolean,
  isSnapshotDimmed: boolean
): number {
  if (isFocusModeDimmed) {
    return 0.04;
  }
  if (isSnapshotDimmed) {
    return 0.08;
  }
  if (dimmed) {
    return 0.15;
  }
  return 1;
}

function resolveStrokeColor(
  activeLayer: string,
  isError: boolean,
  isWarning: boolean,
  isTraceActive: boolean,
  errorRate: number
): string {
  if (activeLayer === "live") {
    return getTracingStroke(isError, isWarning, isTraceActive);
  }
  if (activeLayer === "platform") {
    return getPlatformStroke(errorRate);
  }
  if (activeLayer === "building") {
    return "oklch(0.45 0.03 270)";
  }
  return "oklch(0.35 0.02 270)";
}

function isEdgeSnapshotHighlighted(
  affectedEdgeIds: string[] | undefined,
  affectedNodeIds: string[],
  id: string,
  source: string,
  target: string
): boolean {
  if (affectedEdgeIds !== undefined) {
    return affectedEdgeIds.includes(id);
  }
  return affectedNodeIds.includes(source) && affectedNodeIds.includes(target);
}

export function DataFlowEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<SystemEdgeType>) {
  const activeLayer = useLayerStore((s) => s.activeLayer);
  const focusModeNodeId = useLayerStore((s) => s.focusModeNodeId);
  const activeTimelineEvent = useLayerStore((s) => s.activeTimelineEvent);
  const isFocusModeEdge =
    focusModeNodeId !== null &&
    (source === focusModeNodeId || target === focusModeNodeId);
  const isFocusModeDimmed = focusModeNodeId !== null && !isFocusModeEdge;
  const isSnapshotActive = activeTimelineEvent !== null;
  const isSnapshotHighlighted =
    isSnapshotActive &&
    isEdgeSnapshotHighlighted(
      activeTimelineEvent?.affectedEdgeIds,
      activeTimelineEvent?.affectedNodeIds ?? [],
      id,
      source,
      target
    );
  const isSnapshotDimmed = isSnapshotActive && !isSnapshotHighlighted;
  const isSnapshotBug = activeTimelineEvent?.kind === "bug";
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 6,
  });

  const tracing = data?.tracing;
  const platform = data?.platform;
  // In live layer: all edges are animated with uniform flow (no error highlighting).
  const isTraceActive = activeLayer === "live";
  const isError = false;
  const isWarning = false;
  const dimmed = false;

  const strokeColor = resolveStrokeColor(
    activeLayer,
    isError,
    isWarning,
    isTraceActive,
    platform?.errorRate ?? 0
  );

  const showLabel = !!(
    data?.label &&
    (selected || activeLayer === "live" || activeLayer === "building")
  );
  const showThroughput = activeLayer === "live" && !!tracing?.throughput;
  const showMetrics = activeLayer === "platform" && platform;

  const focusDrawStyle = isFocusModeEdge
    ? {
        strokeDasharray: 3000,
        strokeDashoffset: 3000,
        animation: "edge-draw-in 0.55s 0.1s ease-out forwards",
      }
    : {};

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: isTraceActive || selected ? 2 : 1.5,
          opacity: edgeOpacity(isFocusModeDimmed, dimmed, isSnapshotDimmed),
          ...(isSnapshotHighlighted && {
            stroke: isSnapshotBug
              ? "oklch(0.65 0.25 15)"
              : "oklch(0.78 0.15 200)",
            strokeWidth: 2.5,
          }),
          ...focusDrawStyle,
        }}
      />
      {!isFocusModeDimmed && (
        <EdgeFlowIndicator
          edgePath={edgePath}
          isError={isError}
          isTraceActive={isTraceActive}
          strokeColor={strokeColor}
        />
      )}
      <EdgeLabelRenderer>
        {!isFocusModeDimmed && showLabel && data && (
          <EdgeLabel
            data={data}
            isError={isError}
            isWarning={isWarning}
            labelX={labelX}
            labelY={labelY}
            throughput={showThroughput ? tracing?.throughput : undefined}
          />
        )}
        {!isFocusModeDimmed && showMetrics && platform && (
          <EdgeMetrics labelX={labelX} labelY={labelY} platform={platform} />
        )}
      </EdgeLabelRenderer>
    </>
  );
}
