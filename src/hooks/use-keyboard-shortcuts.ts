import { useEffect } from "react";
import type { LayerId } from "@/data/types";
import { useLayerStore } from "@/stores/layer-store";

const layerKeys: Record<string, LayerId> = {
  "1": "tracing",
  "2": "building",
  "3": "platform",
};

export function useKeyboardShortcuts() {
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer);
  const setSelectedNodeId = useLayerStore((s) => s.setSelectedNodeId);
  const focusModeNodeId = useLayerStore((s) => s.focusModeNodeId);
  const exitFocusMode = useLayerStore((s) => s.exitFocusMode);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const layer = layerKeys[e.key];
      if (layer) {
        e.preventDefault();
        setActiveLayer(layer);
        return;
      }

      if (e.key === "Escape") {
        if (focusModeNodeId !== null) {
          // fitView is handled by the effect in system-canvas watching focusModeNodeId.
          exitFocusMode();
        } else {
          setSelectedNodeId(null);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveLayer, setSelectedNodeId, focusModeNodeId, exitFocusMode]);
}
