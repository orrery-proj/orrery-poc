import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLayerStore } from "@/stores/layer-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { SystemNodeComponent } from "./nodes/SystemNode";
import { DataFlowEdge } from "./edges/DataFlowEdge";
import { GhostEdge } from "./edges/GhostEdge";
import { CanvasHeader } from "./CanvasHeader";
import { NodeDetailPanel } from "../panels/NodeDetailPanel";
import { BuildingToolbar } from "../panels/BuildingToolbar";
import type { SystemNodeData } from "@/data/types";

type SystemNodeType = Node<SystemNodeData>;

// Defined outside the component so the reference is stable across renders.
const nodeTypes = { system: SystemNodeComponent };
const edgeTypes = { dataflow: DataFlowEdge, ghost: GhostEdge };
const proOptions = { hideAttribution: true };

const bgColors = {
  tracing: "oklch(0.78 0.15 200 / 0.15)",
  building: "oklch(0.80 0.16 80 / 0.10)",
  platform: "oklch(0.77 0.15 165 / 0.12)",
} as const;

export function SystemCanvas() {
  useKeyboardShortcuts();

  const activeLayer = useLayerStore((s) => s.activeLayer);
  const selectedNodeId = useLayerStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useLayerStore((s) => s.setSelectedNodeId);

  // Initialize React Flow state with the initial layer's data.
  const [nodes, setNodes, onNodesChange] = useNodesState(
    useLayerStore.getState().getNodes(),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    useLayerStore.getState().getEdges(),
  );

  // Sync canvas data whenever the active layer changes.
  // useEffect is correct here — this is a side effect (updating React Flow
  // internal state) that must run after render, not during it.
  useEffect(() => {
    const { getNodes, getEdges } = useLayerStore.getState();
    setNodes(getNodes());
    setEdges(getEdges());
  }, [activeLayer, setNodes, setEdges]);

  const onSelectionChange: OnSelectionChangeFunc = ({ nodes: selected }) => {
    setSelectedNodeId(selected.length === 1 ? selected[0].id : null);
  };

  const onPaneClick = () => setSelectedNodeId(null);

  const selectedNode = nodes.find(
    (n) => n.id === selectedNodeId,
  ) as SystemNodeType | undefined;

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={proOptions}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: "dataflow" }}
        className="!bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={bgColors[activeLayer]}
          className="transition-colors duration-700"
        />
        <Controls showInteractive={false} className="!bottom-4 !right-4 !left-auto" />
        <MiniMap
          nodeColor={() => "oklch(0.40 0.03 270)"}
          maskColor="oklch(0.08 0.01 270 / 0.85)"
          className="!bottom-4 !left-4"
          style={{ width: 160, height: 110 }}
          pannable
          zoomable
        />
      </ReactFlow>

      <CanvasHeader />
      <BuildingToolbar />
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
