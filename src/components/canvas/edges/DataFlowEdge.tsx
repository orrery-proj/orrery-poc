import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  type Edge,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/stores/layer-store";
import type { SystemEdgeData } from "@/data/types";

type SystemEdgeType = Edge<SystemEdgeData>;

export function DataFlowEdge({
  id,
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const tracing = data?.tracing;
  const platform = data?.platform;

  const isTraceActive = activeLayer === "tracing" && tracing?.active;
  const isError = tracing?.status === "error";
  const isWarning = tracing?.status === "warning";
  const dimmed = activeLayer === "tracing" && !tracing?.active;

  let strokeColor = "oklch(0.35 0.02 270)";
  if (activeLayer === "tracing") {
    if (isError) strokeColor = "oklch(0.65 0.25 15)";
    else if (isWarning) strokeColor = "oklch(0.75 0.18 55)";
    else if (isTraceActive) strokeColor = "oklch(0.78 0.15 200)";
    else strokeColor = "oklch(0.25 0.01 270)";
  } else if (activeLayer === "platform") {
    const errorRate = platform?.errorRate ?? 0;
    if (errorRate > 10) strokeColor = "oklch(0.65 0.25 15)";
    else if (errorRate > 1) strokeColor = "oklch(0.75 0.18 55)";
    else strokeColor = "oklch(0.50 0.08 165)";
  } else if (activeLayer === "building") {
    strokeColor = "oklch(0.45 0.03 270)";
  }

  const showLabel = data?.label && (selected || isTraceActive || activeLayer === "building");
  const showMetrics = activeLayer === "platform" && platform;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: isTraceActive || selected ? 2 : 1.5,
          opacity: dimmed ? 0.15 : 1,
          transition: "stroke 0.5s, opacity 0.5s, stroke-width 0.3s",
        }}
      />

      {/* Animated flow indicator for active traces */}
      {isTraceActive && !isError && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="6 6"
          className="animate-[trace-flow_1s_linear_infinite]"
          style={{ opacity: 0.6 }}
        />
      )}

      {isError && (
        <path
          d={edgePath}
          fill="none"
          stroke="oklch(0.65 0.25 15)"
          strokeWidth={3}
          strokeDasharray="4 8"
          className="animate-[trace-flow_0.5s_linear_infinite]"
          style={{ opacity: 0.4 }}
        />
      )}

      <EdgeLabelRenderer>
        {showLabel && (
          <div
            className={cn(
              "absolute pointer-events-all nodrag nopan",
              "px-2 py-0.5 rounded text-[9px] font-mono",
              "bg-card/90 backdrop-blur-sm border border-border/50",
              "text-muted-foreground",
              isError && "border-layer-error/30 text-layer-error/80",
              isWarning && "border-layer-warning/30 text-layer-warning/80",
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data?.label}
            {data?.protocol && (
              <span className="ml-1.5 text-[8px] opacity-60">{data.protocol}</span>
            )}
          </div>
        )}

        {showMetrics && platform && (
          <div
            className="absolute pointer-events-all nodrag nopan px-2 py-1 rounded text-[9px] font-mono bg-card/90 backdrop-blur-sm border border-border/40"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{platform.requestsPerSec} rps</span>
              <span className={cn(
                (platform.errorRate ?? 0) > 10 ? "text-red-400" : (platform.errorRate ?? 0) > 1 ? "text-amber-400" : "text-emerald-400",
              )}>
                {platform.errorRate}% err
              </span>
              <span>p99: {platform.p99Latency}ms</span>
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
