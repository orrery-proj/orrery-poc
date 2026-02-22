import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Server,
  Database,
  Radio,
  Globe,
  HardDrive,
  Clock,
  Cpu,
  MemoryStick,
  Box,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLayerStore } from "@/stores/layer-store";
import type { NodeKind, HealthStatus, ServiceFeature, SystemNodeData } from "@/data/types";
import type { Node } from "@xyflow/react";

const kindIcons: Record<NodeKind, React.ElementType> = {
  gateway: Globe,
  service: Server,
  database: Database,
  queue: Radio,
  cache: HardDrive,
};

const healthConfig: Record<HealthStatus, { color: string; icon: React.ElementType; label: string }> = {
  healthy: { color: "text-emerald-400", icon: CheckCircle2, label: "Healthy" },
  degraded: { color: "text-amber-400", icon: AlertCircle, label: "Degraded" },
  critical: { color: "text-red-400", icon: XCircle, label: "Critical" },
  warning: { color: "text-amber-400", icon: AlertCircle, label: "Warning" },
  unknown: { color: "text-zinc-500", icon: AlertCircle, label: "Unknown" },
};

function FeatureItem({ feature }: { feature: ServiceFeature }) {
  const health = healthConfig[feature.status];
  const HealthIcon = health.icon;

  return (
    <div className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-white/[0.02] transition-colors">
      <HealthIcon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", health.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-foreground">{feature.name}</span>
          <span
            className="text-[9px] font-mono px-1 rounded-sm"
            style={{ color: feature.team.color, backgroundColor: feature.team.color + "15" }}
          >
            {feature.team.name}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">{feature.description}</p>
      </div>
    </div>
  );
}

export function NodeDetailPanel({
  node,
  onClose,
}: {
  node: Node<SystemNodeData>;
  onClose: () => void;
}) {
  const activeLayer = useLayerStore((s) => s.activeLayer);
  const data = node.data;
  const Icon = kindIcons[data.kind];

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        className="absolute top-4 right-4 z-50 w-[300px] max-h-[calc(100vh-32px)] overflow-y-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{data.label}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground capitalize">{data.kind}</span>
                    {data.team && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: data.team.color }}
                        >
                          {data.team.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{data.description}</p>
          </div>

          <Separator className="opacity-50" />

          {/* Tracing details */}
          {activeLayer === "tracing" && data.tracing && (
            <div className="p-4 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                Trace Info
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Latency
                  </span>
                  <span className={cn(
                    "font-mono",
                    data.tracing.status === "error" ? "text-layer-error" : "text-foreground",
                  )}>
                    {data.tracing.latencyMs >= 1000
                      ? `${(data.tracing.latencyMs / 1000).toFixed(1)}s`
                      : `${data.tracing.latencyMs}ms`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3" /> Span ID
                  </span>
                  <span className="font-mono text-foreground/70">{data.tracing.spanId}</span>
                </div>
                {data.tracing.errorMessage && (
                  <div className="p-2 rounded-md bg-layer-error/5 border border-layer-error/10">
                    <p className="text-[10px] text-layer-error font-mono leading-relaxed">
                      {data.tracing.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Platform details */}
          {activeLayer === "platform" && data.platform && (
            <div className="p-4 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                Infrastructure
              </h4>
              <div className="space-y-2.5">
                {/* Health */}
                {(() => {
                  const health = healthConfig[data.platform.health];
                  const HealthIcon = health.icon;
                  return (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Health</span>
                      <span className={cn("flex items-center gap-1 font-medium", health.color)}>
                        <HealthIcon className="w-3 h-3" /> {health.label}
                      </span>
                    </div>
                  );
                })()}
                {/* CPU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                    <span className="font-mono">{data.platform.cpu}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        data.platform.cpu > 80 ? "bg-red-400" : data.platform.cpu > 60 ? "bg-amber-400" : "bg-emerald-400",
                      )}
                      style={{ width: `${data.platform.cpu}%` }}
                    />
                  </div>
                </div>
                {/* Memory */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><MemoryStick className="w-3 h-3" /> Memory</span>
                    <span className="font-mono">{data.platform.memory}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        data.platform.memory > 80 ? "bg-red-400" : data.platform.memory > 60 ? "bg-amber-400" : "bg-emerald-400",
                      )}
                      style={{ width: `${data.platform.memory}%` }}
                    />
                  </div>
                </div>
                {/* Pods */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1"><Box className="w-3 h-3" /> Pods</span>
                  <span className="font-mono">
                    {data.platform.pods.ready}/{data.platform.pods.total} ready
                  </span>
                </div>
                {/* Deploy info */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono text-foreground/70">{data.platform.version}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-mono text-foreground/70">{data.platform.uptime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Building details */}
          {activeLayer === "building" && data.building?.isDraft && (
            <div className="p-4 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-layer-building/50">
                Proposal
              </h4>
              {data.building.ticketId && (
                <Badge className="bg-layer-building/10 text-layer-building/80 border-layer-building/20 hover:bg-layer-building/10 font-mono text-[10px]">
                  {data.building.ticketId}
                </Badge>
              )}
              {data.building.description && (
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  {data.building.description}
                </p>
              )}
              {data.building.proposedBy && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Proposed by {data.building.proposedBy}</span>
                </div>
              )}
            </div>
          )}

          {/* Features (zoom-in preview) */}
          {data.features && data.features.length > 0 && (
            <>
              <Separator className="opacity-50" />
              <div className="p-4 space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  Features
                </h4>
                <div className="space-y-0.5">
                  {data.features.map((feature) => (
                    <FeatureItem key={feature.id} feature={feature} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
