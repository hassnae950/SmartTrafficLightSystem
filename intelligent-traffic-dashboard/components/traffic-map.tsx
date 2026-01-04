"use client"
import { Car, TrafficCone as TrafficLight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Intersection {
  id: string
  x: number
  y: number
  lightStatus: "red" | "yellow" | "green"
}

interface RoadSegment {
  id: string
  from: string
  to: string
  density: number // 0 to 100
  carsCount: number
}

interface TrafficMapProps {
  intersections: Intersection[]
  roads: RoadSegment[]
}

export function TrafficMap({ intersections, roads }: TrafficMapProps) {
  const getDensityColor = (density: number) => {
    if (density < 30) return "stroke-emerald-500"
    if (density < 70) return "stroke-amber-500"
    return "stroke-rose-500"
  }

  const getDensityBg = (density: number) => {
    if (density < 30) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (density < 70) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    return "bg-rose-500/20 text-rose-400 border-rose-500/30"
  }

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm">
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        {/* Road Backgrounds (Glow effect) */}
        {roads.map((road) => {
          const from = intersections.find((i) => i.id === road.from)
          const to = intersections.find((i) => i.id === road.to)
          if (!from || !to) return null

          return (
            <line
              key={`bg-${road.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth="12"
              className={cn("opacity-20 blur-md transition-all duration-1000", getDensityColor(road.density))}
            />
          )
        })}

        {/* Road Lines */}
        {roads.map((road) => {
          const from = intersections.find((i) => i.id === road.from)
          const to = intersections.find((i) => i.id === road.to)
          if (!from || !to) return null

          return (
            <line
              key={road.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth="6"
              strokeDasharray="4 4"
              className={cn("transition-all duration-1000", getDensityColor(road.density))}
            />
          )
        })}

        {/* Intersections / Traffic Lights */}
        {intersections.map((node) => (
          <g key={node.id} transform={`translate(${node.x - 12}, ${node.y - 12})`}>
            <circle cx="12" cy="12" r="16" className="fill-slate-900 stroke-border/50" />
            <TrafficLight
              size={16}
              className={cn(
                "transition-colors duration-300",
                node.lightStatus === "green"
                  ? "text-emerald-500"
                  : node.lightStatus === "yellow"
                    ? "text-amber-500"
                    : "text-rose-500",
              )}
              x="4"
              y="4"
            />
          </g>
        ))}
      </svg>

      {/* Real-time labels */}
      {roads.map((road) => {
        const from = intersections.find((i) => i.id === road.from)
        const to = intersections.find((i) => i.id === road.to)
        if (!from || !to) return null

        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2

        return (
          <div
            key={`label-${road.id}`}
            style={{ left: `${(midX / 800) * 100}%`, top: `${(midY / 600) * 100}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 transition-all duration-500",
              getDensityBg(road.density),
            )}
          >
            <Car size={10} />
            {road.carsCount}
          </div>
        )
      })}
    </div>
  )
}
