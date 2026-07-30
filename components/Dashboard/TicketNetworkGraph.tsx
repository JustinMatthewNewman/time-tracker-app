"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from "d3-force";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { groupByTicket, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { CATEGORICAL_HUE_COUNT, getSeriesColor } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const WIDTH = 420;
const HEIGHT = 280;
const TICK_ITERATIONS = 300;

interface GraphNode extends SimulationNodeDatum {
  id: string;
  degree: number;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

// Real co-occurrence: two tickets are "connected" whenever they both appear
// somewhere in the same WorkLog. Counted once per work log (not once per
// entry pair), then normalized against the busiest pair so link opacity
// stays meaningful regardless of how many work logs exist overall.
function computeCoOccurrenceLinks(entries: MyTimeEntry[], ticketIds: string[]): GraphLink[] {
  const allowed = new Set(ticketIds);
  const ticketsByWorkLog = new Map<string, Set<string>>();

  for (const entry of entries) {
    if (!entry.workLogId) continue;
    const ticketLabel = entry.ticket ? String(entry.ticket.ticketNumber) : UNASSIGNED_TICKET;
    if (!allowed.has(ticketLabel)) continue;
    const set = ticketsByWorkLog.get(entry.workLogId);
    if (set) set.add(ticketLabel);
    else ticketsByWorkLog.set(entry.workLogId, new Set([ticketLabel]));
  }

  const counts = new Map<string, number>();
  for (const ticketSet of ticketsByWorkLog.values()) {
    const tickets = Array.from(ticketSet);
    for (let i = 0; i < tickets.length; i++) {
      for (let j = i + 1; j < tickets.length; j++) {
        const key = [tickets[i], tickets[j]].sort().join("|");
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }

  const maxCount = Math.max(1, ...counts.values());
  return Array.from(counts.entries()).map(([key, count]) => {
    const [source, target] = key.split("|");
    return { source, target, weight: count / maxCount };
  });
}

// Node positions computed once via d3-force, ticked synchronously (no live
// animation) — matches this app's "D3 for math only, hand-authored SVG for
// rendering" convention. Initial positions are placed on a circle (not
// d3-force's internal Math.random() default) so the settled layout is
// reproducible across reloads instead of jittering every render.
//
// forceLink mutates each link's source/target in place, replacing the
// string id with the actual resolved node object once the simulation
// initializes — so the links array passed in must be read back afterward
// (via the returned resolvedLinks) rather than re-resolved by id, which
// would silently fail once source/target are no longer strings.
interface ResolvedLink {
  source: GraphNode;
  target: GraphNode;
  weight: number;
}

function layoutGraph(nodeIds: string[], links: GraphLink[]): { nodes: GraphNode[]; resolvedLinks: ResolvedLink[] } {
  const nodes: GraphNode[] = nodeIds.map((id, i) => {
    const angle = (i / nodeIds.length) * 2 * Math.PI;
    return {
      id,
      degree: links.filter((l) => l.source === id || l.target === id).length,
      x: WIDTH / 2 + Math.cos(angle) * 100,
      y: HEIGHT / 2 + Math.sin(angle) * 100,
    };
  });

  const sim = forceSimulation(nodes)
    .force(
      "link",
      forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(70)
        .strength((l) => l.weight * 0.5)
    )
    .force("charge", forceManyBody().strength(-140))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("collide", forceCollide<GraphNode>((d) => 12 + d.degree * 2))
    .stop();

  sim.tick(TICK_ITERATIONS);
  return { nodes, resolvedLinks: links as unknown as ResolvedLink[] };
}

interface TicketNetworkGraphProps {
  entries: MyTimeEntry[];
  loading: boolean;
}

// entries/loading come from AnalyticsDashboard's single useMyTimeEntries()
// call — see TicketDurationBoxPlot's comment for why every widget can't
// just fetch its own copy of this all-time dataset.
export function TicketNetworkGraph({ entries, loading }: TicketNetworkGraphProps) {
  const { tooltip, showAt, hide } = useChartTooltip<{ ticket: string; connections: number }>();

  const ticketIds = useMemo(() => groupByTicket(entries).slice(0, CATEGORICAL_HUE_COUNT).map((t) => t.ticket), [entries]);
  const links = useMemo(() => computeCoOccurrenceLinks(entries, ticketIds), [entries, ticketIds]);
  const { nodes, resolvedLinks } = useMemo(
    () => (ticketIds.length >= 2 ? layoutGraph(ticketIds, links) : { nodes: [], resolvedLinks: [] }),
    [ticketIds, links]
  );

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Ticket connection network</h2>
      </div>

      {nodes.length === 0 && !loading ? (
        <p className="py-10 text-center text-sm text-foreground/60">Need at least 2 tickets sharing a work log to graph connections.</p>
      ) : (
        <div className="relative w-full">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
            {resolvedLinks.map((link) => {
              return (
                <line
                  key={`${link.source.id}-${link.target.id}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke="var(--foreground)"
                  strokeOpacity={0.15 + link.weight * 0.35}
                  strokeWidth={1}
                />
              );
            })}

            {nodes.map((node, i) => {
              const style = getSeriesColor(i);
              const radius = 8 + node.degree * 2;
              return (
                <g
                  key={node.id}
                  onPointerEnter={(e) => showAt(e, { ticket: node.id, connections: node.degree })}
                  onPointerLeave={hide}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={style.color}
                    style={style.filter ? { filter: style.filter } : undefined}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                  <text x={node.x} y={(node.y ?? 0) - radius - 4} textAnchor="middle" fontSize={10} className="fill-foreground/70">
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">Ticket {tooltip.data.ticket}</div>
              <div className="text-foreground/60">{tooltip.data.connections} connection{tooltip.data.connections === 1 ? "" : "s"}</div>
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>Ticket connection network</caption>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Connections</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.id}>
              <td>{node.id}</td>
              <td>{node.degree}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default TicketNetworkGraph;
