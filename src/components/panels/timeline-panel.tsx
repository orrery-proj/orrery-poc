import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { timelineEvents } from "@/data/system";
import type { TimelineEvent } from "@/data/types";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/stores/layer-store";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

const kindColors: Record<
  TimelineEvent["kind"],
  { dot: string; border: string; bg: string; label: string }
> = {
  deployment: {
    dot: "bg-[oklch(0.65_0.18_250)]",
    border: "border-[oklch(0.65_0.18_250)/40]",
    bg: "bg-[oklch(0.65_0.18_250)/10]",
    label: "text-[oklch(0.75_0.18_250)]",
  },
  bug: {
    dot: "bg-[oklch(0.65_0.25_15)]",
    border: "border-[oklch(0.65_0.25_15)/40]",
    bg: "bg-[oklch(0.65_0.25_15)/10]",
    label: "text-[oklch(0.70_0.25_15)]",
  },
  proposal: {
    dot: "bg-[oklch(0.75_0.18_55)]",
    border: "border-[oklch(0.75_0.18_55)/40]",
    bg: "bg-[oklch(0.75_0.18_55)/10]",
    label: "text-[oklch(0.80_0.18_55)]",
  },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventDot({
  event,
  onClick,
}: {
  event: TimelineEvent;
  onClick: () => void;
}) {
  const colors = kindColors[event.kind];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "group flex shrink-0 flex-col items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              colors.border,
              colors.bg,
              "hover:brightness-125"
            )}
            onClick={onClick}
            type="button"
          >
            <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
            <span
              className={cn(
                "max-w-[72px] truncate font-mono text-[9px] leading-none",
                colors.label
              )}
            >
              {event.title}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <div className="max-w-[200px] space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colors.dot)}
              />
              <span className="font-semibold text-[11px]">{event.title}</span>
            </div>
            <p className="text-balance text-[10px] opacity-80">
              {event.description}
            </p>
            <p className="font-mono text-[9px] opacity-50">
              {formatTimestamp(event.timestamp)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TimelinePanel() {
  const timelineOpen = useLayerStore((s) => s.timelineOpen);
  const openTimeline = useLayerStore((s) => s.openTimeline);
  const closeTimeline = useLayerStore((s) => s.closeTimeline);
  const activeTimelineEvent = useLayerStore((s) => s.activeTimelineEvent);
  const enterTimelineSnapshot = useLayerStore((s) => s.enterTimelineSnapshot);
  const exitTimelineSnapshot = useLayerStore((s) => s.exitTimelineSnapshot);
  const timelinePosition = useLayerStore((s) => s.timelinePosition);
  const setTimelinePosition = useLayerStore((s) => s.setTimelinePosition);

  const [rangeOffset, setRangeOffset] = useState(0);
  const [showLeftEdge, setShowLeftEdge] = useState(false);
  const [showRightEdge, setShowRightEdge] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sort events by timestamp descending.
  const sortedEvents = [...timelineEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Visible window: show 5 events offset by rangeOffset.
  const PAGE_SIZE = 5;
  const totalEvents = sortedEvents.length;
  const maxOffset = Math.max(0, totalEvents - PAGE_SIZE);
  const visibleEvents = sortedEvents.slice(
    rangeOffset,
    rangeOffset + PAGE_SIZE
  );

  function handleEventClick(event: TimelineEvent) {
    enterTimelineSnapshot(event);
  }

  function shiftLeft() {
    setRangeOffset((o) => Math.max(0, o - 1));
  }

  function shiftRight() {
    setRangeOffset((o) => Math.min(maxOffset, o + 1));
  }

  function handleMouseEnter() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    openTimeline();
  }

  function handleMouseLeave() {
    hoverTimerRef.current = setTimeout(() => {
      closeTimeline();
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions lint/a11y/noStaticElementInteractions: hover-group delegation; interactive children are buttons
    <div
      className={cn(
        "absolute bottom-4 left-1/2 z-50 -translate-x-1/2",
        timelinePosition && "!left-0 !translate-x-0 !bottom-auto !top-0"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        timelinePosition
          ? {
              position: "absolute",
              left: timelinePosition.x,
              top: timelinePosition.y,
            }
          : {}
      }
    >
      <AnimatePresence mode="wait">
        {timelineOpen ? (
          /* ── Expanded timeline bar ── */
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative"
            drag
            dragMomentum={false}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            key="expanded"
            onDragEnd={(_e, info) => {
              const base = timelinePosition ?? {
                x: window.innerWidth / 2 - 200,
                y: window.innerHeight - 80,
              };
              setTimelinePosition({
                x: base.x + info.offset.x,
                y: base.y + info.offset.y,
              });
            }}
            transition={SPRING}
          >
            <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/80 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
              {/* Left scroll affordance */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: hover zone that reveals a button child; no keyboard interaction needed */}
              <div
                className="relative"
                onMouseEnter={() => setShowLeftEdge(true)}
                onMouseLeave={() => setShowLeftEdge(false)}
              >
                <AnimatePresence>
                  {showLeftEdge && rangeOffset > 0 && (
                    <motion.button
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0, x: -4 }}
                      onClick={shiftLeft}
                      transition={{ duration: 0.15 }}
                      type="button"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      <span className="font-mono">Earlier</span>
                    </motion.button>
                  )}
                </AnimatePresence>
                {(!showLeftEdge || rangeOffset === 0) && (
                  <div className="flex items-center gap-1 px-2 py-1 text-muted-foreground/30">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono text-[10px]">Timeline</span>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-border/30" />

              {/* Event dots */}
              <div className="flex items-center gap-1.5">
                {visibleEvents.map((event) => (
                  <EventDot
                    event={event}
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>

              <div className="h-4 w-px bg-border/30" />

              {/* Right scroll affordance */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: hover zone that reveals a button child; no keyboard interaction needed */}
              <div
                className="relative"
                onMouseEnter={() => setShowRightEdge(true)}
                onMouseLeave={() => setShowRightEdge(false)}
              >
                <AnimatePresence>
                  {showRightEdge && rangeOffset < maxOffset && (
                    <motion.button
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0, x: 4 }}
                      onClick={shiftRight}
                      transition={{ duration: 0.15 }}
                      type="button"
                    >
                      <span className="font-mono">Later</span>
                      <ChevronRight className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
                {(!showRightEdge || rangeOffset >= maxOffset) && (
                  <div className="w-12" />
                )}
              </div>

              {/* Snapshot exit button (shown inside expanded bar too) */}
              {activeTimelineEvent && (
                <>
                  <div className="h-4 w-px bg-border/30" />
                  <button
                    className="flex items-center gap-1.5 rounded-md border border-layer-live/30 bg-layer-live/10 px-2 py-1 text-[10px] text-layer-live transition-colors hover:bg-layer-live/20"
                    onClick={exitTimelineSnapshot}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                    <span className="font-mono">Exit snapshot</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Collapsed pill button ── */
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-center gap-1.5"
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            key="collapsed"
            transition={SPRING}
          >
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-full border border-border/30 bg-card/70 px-3 py-1.5 shadow-black/20 shadow-lg backdrop-blur-xl transition-colors hover:border-border/50",
                activeTimelineEvent && "border-layer-live/40 bg-layer-live/5"
              )}
              type="button"
            >
              <Clock
                className={cn(
                  "h-3.5 w-3.5",
                  activeTimelineEvent
                    ? "text-layer-live"
                    : "text-muted-foreground"
                )}
              />
              {activeTimelineEvent && (
                <span className="max-w-[100px] truncate font-mono text-[10px] text-layer-live">
                  {activeTimelineEvent.title}
                </span>
              )}
            </button>

            {/* Exit snapshot button beside the pill */}
            {activeTimelineEvent && (
              <motion.button
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-full border border-border/30 bg-card/70 px-2.5 py-1.5 text-muted-foreground shadow-black/20 shadow-lg backdrop-blur-xl transition-colors hover:border-border/50 hover:text-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                onClick={exitTimelineSnapshot}
                transition={SPRING}
                type="button"
              >
                <X className="h-3 w-3" />
                <span className="font-mono text-[9px]">Exit</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
