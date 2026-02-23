import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  type Edge,
  EdgeLabelRenderer,
} from "@xyflow/react";
import type { SystemEdgeData } from "@/data/types";

type SystemEdgeType = Edge<SystemEdgeData>;

export function GhostEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<SystemEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "oklch(0.80 0.16 80 / 0.35)",
          strokeWidth: 1.5,
          strokeDasharray: "6 4",
          animation: "ghost-shimmer 3s ease-in-out infinite",
        }}
      />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-all nodrag nopan px-2 py-0.5 rounded text-[9px] font-mono bg-layer-building/5 border border-layer-building/20 text-layer-building/60"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
