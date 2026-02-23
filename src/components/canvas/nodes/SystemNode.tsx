import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  Globe,
  Server,
  Database,
  Radio,
  HardDrive,
  AlertTriangle,
  Activity,
  Clock,
  Box,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLayerStore } from "@/stores/layer-store";
import type { SystemNodeData, NodeKind, HealthStatus } from "@/data/types";

const kindConfig: Record<
  NodeKind,
  { icon: React.ElementType; accent: string; bgAccent: string }
> = {
  gateway: {
    icon: Globe,
    accent: "text-[oklch(0.78_0.15_200)]",
    bgAccent: "bg-[oklch(0.78_0.15_200)]",
  },
  service: {
    icon: Server,
    accent: "text-[oklch(0.78_0.12_260)]",
    bgAccent: "bg-[oklch(0.78_0.12_260)]",
  },
  database: {
    icon: Database,
    accent: "text-[oklch(0.75_0.14_145)]",
    bgAccent: "bg-[oklch(0.75_0.14_145)]",
  },
  queue: {
    icon: Radio,
    accent: "text-[oklch(0.75_0.15_55)]",
    bgAccent: "bg-[oklch(0.75_0.15_55)]",
  },
  cache: {
    icon: HardDrive,
    accent: "text-[oklch(0.70_0.18_330)]",
    bgAccent: "bg-[oklch(0.70_0.18_330)]",
  },
};

const healthColors: Record<HealthStatus, string> = {
  healthy: "text-emerald-400",
  degraded: "text-amber-400",
  critical: "text-red-400",
  warning: "text-amber-400",
  unknown: "text-zinc-500",
};

const healthIcons: Record<HealthStatus, React.ElementType> = {
  healthy: CheckCircle2,
  degraded: AlertCircle,
  critical: XCircle,
  warning: AlertCircle,
  unknown: AlertCircle,
};

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function MetricBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-8 font-mono shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="font-mono text-foreground/70 w-8 text-right">{value}%</span>
    </div>
  );
}

function TracingOverlay({ data }: { data: SystemNodeData }) {
  const tracing = data.tracing;
  if (!tracing) return null;

  const isError = tracing.status === "error";
  const isWarning = tracing.status === "warning";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className={cn(
            "font-mono text-[11px]",
            isError ? "text-layer-error font-semibold" : "text-foreground/70"
          )}>
            {formatLatency(tracing.latencyMs)}
          </span>
        </div>
        {isError && (
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 font-mono">
            ERROR
          </Badge>
        )}
        {isWarning && (
          <Badge className="text-[9px] px-1.5 py-0 h-4 font-mono bg-layer-warning/20 text-layer-warning border-layer-warning/30 hover:bg-layer-warning/20">
            WARN
          </Badge>
        )}
        {tracing.status === "ok" && (
          <Badge className="text-[9px] px-1.5 py-0 h-4 font-mono bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">
            OK
          </Badge>
        )}
      </div>
      {tracing.errorMessage && (
        <p className="text-[10px] text-layer-error/80 leading-tight font-mono bg-layer-error/5 rounded px-1.5 py-1 border border-layer-error/10">
          {tracing.errorMessage}
        </p>
      )}
    </div>
  );
}

function BuildingOverlay({ data }: { data: SystemNodeData }) {
  const building = data.building;
  if (!building) return null;

  if (building.isDraft) {
    return (
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-layer-building/70">
          <FileText className="w-3 h-3" />
          <span className="font-mono">{building.ticketId}</span>
        </div>
        {building.proposedBy && (
          <p className="text-[10px] text-muted-foreground">
            Proposed by {building.proposedBy}
          </p>
        )}
        {building.description && (
          <p className="text-[10px] text-foreground/50 leading-tight">
            {building.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-1">
      <button className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
        <Pencil className="w-3 h-3" />
      </button>
      <button className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

function PlatformOverlay({ data }: { data: SystemNodeData }) {
  const platform = data.platform;
  if (!platform) return null;

  const HealthIcon = healthIcons[platform.health];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <div className={cn("flex items-center gap-1", healthColors[platform.health])}>
          <HealthIcon className="w-3 h-3" />
          <span className="capitalize font-medium">{platform.health}</span>
        </div>
        <span className="font-mono text-muted-foreground">{platform.version}</span>
      </div>
      <MetricBar
        value={platform.cpu}
        label="CPU"
        color={platform.cpu > 80 ? "bg-red-400" : platform.cpu > 60 ? "bg-amber-400" : "bg-emerald-400"}
      />
      <MetricBar
        value={platform.memory}
        label="MEM"
        color={platform.memory > 80 ? "bg-red-400" : platform.memory > 60 ? "bg-amber-400" : "bg-emerald-400"}
      />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Box className="w-3 h-3" />
          <span className="font-mono">{platform.pods.ready}/{platform.pods.total} pods</span>
        </div>
        <span className="font-mono">{platform.lastDeploy}</span>
      </div>
    </div>
  );
}

type SystemNodeType = Node<SystemNodeData>;

export function SystemNodeComponent({
  data,
  selected,
}: NodeProps<SystemNodeType>) {
  const activeLayer = useLayerStore((s) => s.activeLayer);
  const isDraft = data.building?.isDraft ?? false;
  const isError = data.tracing?.status === "error" && activeLayer === "tracing";
  const isOnTracePath = data.tracing && activeLayer === "tracing";
  const isCritical = data.platform?.health === "critical" && activeLayer === "platform";

  const config = kindConfig[data.kind];
  const Icon = config.icon;

  const dimmed =
    activeLayer === "tracing" && !isOnTracePath && data.kind !== "database" && data.kind !== "cache" && data.kind !== "queue";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-border !border-surface !w-2 !h-2" />
      <div
        className={cn(
          "relative w-[220px] rounded-lg border transition-all duration-500",
          "bg-card/80 backdrop-blur-sm",
          selected && "ring-1 ring-ring",
          isDraft && "border-dashed border-layer-building/40 bg-layer-building/5 animate-[ghost-shimmer_3s_ease-in-out_infinite]",
          isError && "border-layer-error/50 animate-[error-pulse_2s_ease-in-out_infinite]",
          isCritical && "border-red-500/40 shadow-[0_0_16px_oklch(0.65_0.25_15_/_0.2)]",
          !isDraft && !isError && !isCritical && "border-border/60",
          dimmed && "opacity-30",
        )}
      >
        {/* Kind accent stripe */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors duration-500",
            isDraft ? "bg-layer-building/50" : config.bgAccent,
            isError && "!bg-layer-error",
            dimmed && "opacity-50",
          )}
        />

        <div className="px-3 py-2.5 pl-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "shrink-0 p-1 rounded",
                isDraft ? "bg-layer-building/10 text-layer-building/70" : "bg-white/5",
                isError && "bg-layer-error/10 text-layer-error",
              )}>
                <Icon className={cn("w-3.5 h-3.5", !isDraft && !isError && config.accent)} />
              </div>
              <div className="min-w-0">
                <h3 className={cn(
                  "text-[12px] font-semibold leading-tight truncate",
                  isDraft && "text-layer-building/80",
                )}>
                  {data.label}
                </h3>
                {data.team && (
                  <span
                    className="text-[9px] font-mono leading-none"
                    style={{ color: data.team.color + "99" }}
                  >
                    {data.team.name}
                  </span>
                )}
              </div>
            </div>
            {isError && (
              <AlertTriangle className="w-4 h-4 text-layer-error shrink-0 animate-pulse" />
            )}
            {activeLayer === "platform" && data.platform && (
              <Activity className={cn("w-3.5 h-3.5 shrink-0", healthColors[data.platform.health])} />
            )}
          </div>

          {/* Description */}
          <p className={cn(
            "text-[10px] text-muted-foreground leading-snug mt-1.5",
            dimmed && "text-muted-foreground/50",
          )}>
            {data.description}
          </p>

          {/* Layer-specific content */}
          {activeLayer === "tracing" && <TracingOverlay data={data} />}
          {activeLayer === "building" && <BuildingOverlay data={data} />}
          {activeLayer === "platform" && <PlatformOverlay data={data} />}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-border !border-surface !w-2 !h-2" />
    </>
  );
}
