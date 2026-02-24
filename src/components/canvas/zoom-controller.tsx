import { useReactFlow, useViewport } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { FOCUS_DWELL_MS, ZOOM_FOCUS_THRESHOLD } from "@/lib/zoom-constants";
import { useLayerStore } from "@/stores/layer-store";

/**
 * Render-null component placed inside <ReactFlow> (accesses RF context).
 *
 * Sole responsibility: start a dwell timer when hoveredNodeId is set AND
 * zoom >= ZOOM_FOCUS_THRESHOLD. After FOCUS_DWELL_MS, call enterFocusMode.
 * Captures the node's screen rect immediately before entering focus mode so
 * the overlay can animate FROM that position (hero transition).
 */
export function ZoomController() {
  const { zoom } = useViewport();
  const rf = useReactFlow();
  const hoveredNodeId = useLayerStore((s) => s.hoveredNodeId);
  const focusModeNodeId = useLayerStore((s) => s.focusModeNodeId);
  const enterFocusMode = useLayerStore((s) => s.enterFocusMode);
  const setFocusModeInitialRect = useLayerStore(
    (s) => s.setFocusModeInitialRect
  );

  const hoveredRef = useRef(hoveredNodeId);
  hoveredRef.current = hoveredNodeId;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cancel = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (focusModeNodeId !== null) {
      cancel();
      return cancel;
    }

    if (hoveredNodeId !== null && zoom >= ZOOM_FOCUS_THRESHOLD) {
      cancel();
      timerRef.current = setTimeout(() => {
        const nodeId = hoveredRef.current;
        if (nodeId === null || zoomRef.current < ZOOM_FOCUS_THRESHOLD) {
          timerRef.current = null;
          return;
        }
        // Capture screen rect for the hero transition before entering focus mode.
        const node = rf.getNode(nodeId);
        if (node) {
          const { x: vpX, y: vpY, zoom: vz } = rf.getViewport();
          setFocusModeInitialRect({
            x: node.position.x * vz + vpX,
            y: node.position.y * vz + vpY,
            w: (node.measured?.width ?? 220) * vz,
            h: (node.measured?.height ?? 160) * vz,
          });
        }
        enterFocusMode(nodeId);
        timerRef.current = null;
      }, FOCUS_DWELL_MS);
    } else {
      cancel();
    }

    return cancel;
  }, [
    hoveredNodeId,
    zoom,
    focusModeNodeId,
    enterFocusMode,
    setFocusModeInitialRect,
    rf,
  ]);

  return null;
}
