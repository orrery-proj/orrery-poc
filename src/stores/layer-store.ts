import { create } from "zustand";
import {
  draftEdges,
  draftNodes,
  systemEdges,
  systemNodes,
} from "@/data/system";
import type {
  LayerId,
  SystemEdge,
  SystemNode,
  TimelineEvent,
} from "@/data/types";

export interface NodeScreenRect {
  h: number;
  w: number;
  x: number;
  y: number;
}

interface LayerState {
  activeLayer: LayerId;
  activeTimelineEvent: TimelineEvent | null;
  closeTimeline: () => void;

  enterFocusMode: (id: string) => void;
  enterTimelineSnapshot: (event: TimelineEvent) => void;
  exitFocusMode: () => void;
  exitTimelineSnapshot: () => void;
  /** Node currently in focus mode (null when none). */
  focusModeInitialRect: NodeScreenRect | null;
  /** Angle in radians (Math.atan2 convention) from focused node center to each neighbor center. */
  focusModeNeighborAngles: Record<string, number> | null;
  /** IDs of nodes directly connected to the focused node (null when not in focus mode). */
  focusModeNeighborIds: string[] | null;
  focusModeNodeId: string | null;
  getEdges: () => SystemEdge[];

  getNodes: () => SystemNode[];
  hoveredNodeId: string | null;
  openTimeline: () => void;
  selectedNodeId: string | null;
  setActiveLayer: (layer: LayerId) => void;
  setFocusModeInitialRect: (rect: NodeScreenRect | null) => void;
  setFocusModeNeighborAngles: (a: Record<string, number> | null) => void;
  setFocusModeNeighborIds: (ids: string[] | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setTimelinePosition: (pos: { x: number; y: number } | null) => void;
  showDraftNodes: boolean;
  timelineOpen: boolean;
  timelinePosition: { x: number; y: number } | null;
}

export const useLayerStore = create<LayerState>((set, get) => ({
  activeLayer: "live",
  activeTimelineEvent: null,
  selectedNodeId: null,
  focusModeNodeId: null,
  focusModeInitialRect: null,
  focusModeNeighborAngles: null,
  focusModeNeighborIds: null,
  hoveredNodeId: null,
  showDraftNodes: true,
  timelineOpen: false,
  timelinePosition: null,

  setActiveLayer: (layer) => set({ activeLayer: layer, selectedNodeId: null }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  enterFocusMode: (id) => set({ focusModeNodeId: id }),
  exitFocusMode: () =>
    set({
      focusModeNodeId: null,
      focusModeNeighborIds: null,
      focusModeNeighborAngles: null,
    }),
  setFocusModeInitialRect: (rect) => set({ focusModeInitialRect: rect }),
  setFocusModeNeighborAngles: (a) => set({ focusModeNeighborAngles: a }),
  setFocusModeNeighborIds: (ids) => set({ focusModeNeighborIds: ids }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),

  openTimeline: () => set({ timelineOpen: true }),
  closeTimeline: () => set({ timelineOpen: false }),

  enterTimelineSnapshot: (event) =>
    set({ activeTimelineEvent: event, timelineOpen: false }),

  exitTimelineSnapshot: () => set({ activeTimelineEvent: null }),

  setTimelinePosition: (pos) => set({ timelinePosition: pos }),

  getNodes: () => {
    const { activeLayer } = get();
    if (activeLayer === "building") {
      return [...systemNodes, ...draftNodes];
    }
    return systemNodes;
  },

  getEdges: () => {
    const { activeLayer } = get();
    if (activeLayer === "building") {
      return [...systemEdges, ...draftEdges];
    }
    return systemEdges;
  },
}));
