"use client"

import { useState, useEffect, useCallback } from "react"
import { TrafficMap } from "@/components/traffic-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Activity, Car, Users, AlertTriangle, Settings2, History, Bus, Zap, UserCircle2, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "warning" | "priority"
}

export default function SmartTrafficDashboard() {
  // State for traffic simulation
  const [intersections, setIntersections] = useState([
    { id: "A", x: 150, y: 150, lightStatus: "red" as const },
    { id: "B", x: 450, y: 150, lightStatus: "green" as const },
    { id: "C", x: 300, y: 300, lightStatus: "yellow" as const },
    { id: "D", x: 150, y: 450, lightStatus: "red" as const },
    { id: "E", x: 450, y: 450, lightStatus: "green" as const },
  ])

  const [roads, setRoads] = useState([
    { id: "R1", from: "A", to: "B", density: 25, carsCount: 12 },
    { id: "R2", from: "B", to: "C", density: 45, carsCount: 22 },
    { id: "R3", from: "C", to: "D", density: 85, carsCount: 42 },
    { id: "R4", from: "D", to: "E", density: 30, carsCount: 15 },
    { id: "R5", from: "A", to: "D", density: 10, carsCount: 5 },
    { id: "R6", from: "B", to: "E", density: 60, carsCount: 30 },
  ])

  const [stats, setStats] = useState({
    cars: 156,
    pedestrians: 23,
    avgCongestion: 42,
    waitingTimes: {
      A: 45,
      B: 12,
      C: 28,
      D: 35,
      E: 18,
    },
  })

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: "14:32", message: "Feux B → Vert (circulation fluide)", type: "info" },
    { id: "2", timestamp: "14:33", message: "Feux A → Rouge (piétons détectés)", type: "warning" },
  ])

  const [lightDuration, setLightDuration] = useState([30])
  const [mode, setMode] = useState<"Normal" | "Emergency" | "VIP">("Normal")

  // Helper to add logs
  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message,
      type,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 19)])
  }, [])

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setRoads((prev) =>
        prev.map((road) => {
          const delta = Math.floor(Math.random() * 5) - 2
          const newCount = Math.max(0, road.carsCount + delta)
          const newDensity = Math.min(100, Math.floor((newCount / 50) * 100))
          return { ...road, carsCount: newCount, density: newDensity }
        }),
      )

      setStats((prev) => {
        const newCars = prev.cars + (Math.floor(Math.random() * 11) - 5)
        const totalDensity = roads.reduce((acc, r) => acc + r.density, 0)
        return {
          ...prev,
          cars: Math.max(0, newCars),
          avgCongestion: Math.floor(totalDensity / roads.length),
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [roads])

  // Demo Scenarios
  const triggerMatchScenario = () => {
    setRoads((prev) => prev.map((r) => ({ ...r, density: Math.min(100, r.density + 40), carsCount: r.carsCount + 20 })))
    addLog("SCÉNARIO MATCH ACTIVÉ : Trafic entrant massif détecté", "warning")
  }

  const triggerPedestrian = () => {
    setIntersections((prev) => prev.map((i) => (i.id === "A" ? { ...i, lightStatus: "red" } : i)))
    addLog("Feux A → Rouge : Piétons détectés sur le passage", "warning")
  }

  const triggerVIPBus = () => {
    setMode("VIP")
    setIntersections((prev) => prev.map((i) => (i.id === "C" ? { ...i, lightStatus: "green" } : i)))
    addLog("MODE VIP : Priorité accordée au convoi sur segment C", "priority")
    setTimeout(() => setMode("Normal"), 5000)
  }

  const resetEquity = () => {
    setStats((prev) => ({
      ...prev,
      waitingTimes: { A: 15, B: 15, C: 15, D: 15, E: 15 },
    }))
    addLog("RÉINITIALISATION ÉQUITÉ : Algorithme balancé activé", "info")
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Activity className="text-primary w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SmartFlow Pro</h1>
            <p className="text-xs text-muted-foreground font-mono">SYSTEM_v4.2 // CLOUD_STABLE</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 animate-in fade-in zoom-in duration-500",
              mode === "VIP"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/50"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/50",
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
            Mode: {mode}
          </Badge>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Dernière Sync</p>
            <p className="text-sm font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel - Stats & Controls */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="border-border/40 bg-card/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                Statistiques Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Véhicules</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Car size={18} className="text-primary" />
                    {stats.cars}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50 border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Piétons</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Users size={18} className="text-accent" />
                    {stats.pedestrians}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-bold text-[9px]">Congestion Moyenne</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      stats.avgCongestion > 70
                        ? "text-rose-500"
                        : stats.avgCongestion > 40
                          ? "text-amber-500"
                          : "text-emerald-500",
                    )}
                  >
                    {stats.avgCongestion}%
                  </span>
                </div>
                <Progress value={stats.avgCongestion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 size={16} className="text-primary" />
                Contrôles Manuels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Intervalle Feux Verts</span>
                  <span className="font-mono bg-primary/20 text-primary px-1.5 rounded">{lightDuration}s</span>
                </div>
                <Slider value={lightDuration} onValueChange={setLightDuration} max={120} step={5} />
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("Emergency")}
                  className="justify-start gap-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50"
                >
                  <AlertTriangle size={14} /> Mode Urgence
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMode("Normal")} className="justify-start gap-2">
                  <Activity size={14} /> Mode Standard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20 backdrop-blur-sm flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History size={16} className="text-primary" />
                Logs Décisions IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 pb-4">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-[11px] items-start animate-in slide-in-from-right-2">
                      <span className="text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</span>
                      <span
                        className={cn(
                          "leading-tight",
                          log.type === "warning"
                            ? "text-rose-400"
                            : log.type === "priority"
                              ? "text-amber-400"
                              : "text-emerald-400",
                        )}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Central Map Section */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1">
            <TrafficMap intersections={intersections} roads={roads} />
          </div>

          {/* Quick Scenarios Bar */}
          <div className="grid grid-cols-4 gap-4 h-24">
            <Button
              variant="secondary"
              className="h-full flex flex-col gap-1 items-center justify-center bg-slate-900/40 hover:bg-primary/20 transition-all border-border/40 group"
              onClick={triggerMatchScenario}
            >
              <Trophy size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Scénario Match</span>
            </Button>
            <Button
              variant="secondary"
              className="h-full flex flex-col gap-1 items-center justify-center bg-slate-900/40 hover:bg-primary/20 transition-all border-border/40 group"
              onClick={triggerPedestrian}
            >
              <UserCircle2 size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Piétons Détectés</span>
            </Button>
            <Button
              variant="secondary"
              className="h-full flex flex-col gap-1 items-center justify-center bg-slate-900/40 hover:bg-primary/20 transition-all border-border/40 group"
              onClick={triggerVIPBus}
            >
              <Bus size={20} className="group-hover:scale-110 transition-transform text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Bus VIP Priorité</span>
            </Button>
            <Button
              variant="secondary"
              className="h-full flex flex-col gap-1 items-center justify-center bg-slate-900/40 hover:bg-primary/20 transition-all border-border/40 group"
              onClick={resetEquity}
            >
              <Zap size={20} className="group-hover:scale-110 transition-transform text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Reset Équité</span>
            </Button>
          </div>
        </div>

        {/* Right Panel - Equity Indicators */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="border-border/40 bg-card/20 backdrop-blur-sm flex-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Indicateurs d'Équité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(stats.waitingTimes).map(([segment, time]) => (
                <div key={segment} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-muted-foreground uppercase">Segment {segment}</span>
                    <span
                      className={cn(
                        "font-mono font-bold px-2 py-0.5 rounded",
                        time > 40 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400",
                      )}
                    >
                      {time}s d'attente
                    </span>
                  </div>
                  <Progress value={(time / 60) * 100} className="h-1.5" />
                </div>
              ))}

              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs text-muted-foreground italic leading-tight">
                    L'algorithme IA ajuste dynamiquement les phases pour minimiser l'écart type d'attente.
                  </span>
                </div>
                <div className="h-32 w-full flex items-end justify-between gap-1 px-2">
                  {[40, 65, 30, 85, 45, 60, 20, 75].map((h, i) => (
                    <div
                      key={i}
                      className="w-full bg-primary/40 rounded-t-sm transition-all duration-1000 animate-in slide-in-from-bottom"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-center text-muted-foreground mt-2 uppercase font-bold tracking-widest">
                  Rotation Rotation Feux Verts (Cycle)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
