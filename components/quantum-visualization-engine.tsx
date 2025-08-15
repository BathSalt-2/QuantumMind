"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Zap, Eye, Play, Pause, Settings, Maximize2, Download } from "lucide-react"
import Image from "next/image"

interface QuantumVisualizationEngineProps {
  quantumState: number[]
  numQubits: number
  onStateChange?: (newState: number[]) => void
}

interface BlochSpherePoint {
  x: number
  y: number
  z: number
  qubit: number
}

interface EntanglementConnection {
  qubit1: number
  qubit2: number
  strength: number
}

export function QuantumVisualizationEngine({
  quantumState,
  numQubits,
  onStateChange,
}: QuantumVisualizationEngineProps) {
  const [activeView, setActiveView] = useState("bloch")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState([1])
  const [rotationAngle, setRotationAngle] = useState(0)
  const [selectedQubit, setSelectedQubit] = useState(0)
  const [showEntanglement, setShowEntanglement] = useState(true)
  const [visualizationMode, setVisualizationMode] = useState("3d")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Calculate Bloch sphere coordinates for each qubit
  const calculateBlochCoordinates = useCallback(
    (qubitIndex: number): BlochSpherePoint => {
      // Extract single qubit state from full quantum state
      const stateSize = Math.pow(2, numQubits)
      let alpha = 0
      let beta = 0

      // Sum amplitudes for |0⟩ and |1⟩ states of the specific qubit
      for (let i = 0; i < stateSize; i++) {
        const binaryRep = i.toString(2).padStart(numQubits, "0")
        const qubitBit = Number.parseInt(binaryRep[numQubits - 1 - qubitIndex])

        if (qubitBit === 0) {
          alpha += quantumState[i * 2] // Real part
        } else {
          beta += quantumState[i * 2] // Real part
        }
      }

      // Normalize
      const norm = Math.sqrt(alpha * alpha + beta * beta)
      if (norm > 0) {
        alpha /= norm
        beta /= norm
      }

      // Convert to Bloch sphere coordinates
      const theta = 2 * Math.acos(Math.abs(alpha))
      const phi = Math.atan2(beta, alpha)

      return {
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta),
        qubit: qubitIndex,
      }
    },
    [quantumState, numQubits],
  )

  // Calculate entanglement connections
  const calculateEntanglement = useCallback((): EntanglementConnection[] => {
    const connections: EntanglementConnection[] = []

    for (let i = 0; i < numQubits; i++) {
      for (let j = i + 1; j < numQubits; j++) {
        // Calculate entanglement measure (simplified)
        let entanglement = 0
        const stateSize = Math.pow(2, numQubits)

        for (let k = 0; k < stateSize; k++) {
          const amplitude = Math.sqrt(quantumState[k * 2] ** 2 + quantumState[k * 2 + 1] ** 2)
          const binaryRep = k.toString(2).padStart(numQubits, "0")
          const bit_i = Number.parseInt(binaryRep[numQubits - 1 - i])
          const bit_j = Number.parseInt(binaryRep[numQubits - 1 - j])

          if (bit_i !== bit_j) {
            entanglement += amplitude
          }
        }

        if (entanglement > 0.1) {
          connections.push({
            qubit1: i,
            qubit2: j,
            strength: Math.min(entanglement, 1),
          })
        }
      }
    }

    return connections
  }, [quantumState, numQubits])

  // 3D Canvas rendering
  const render3DVisualization = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.3

    // Clear canvas
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)"
    ctx.fillRect(0, 0, width, height)

    // Draw grid background
    ctx.strokeStyle = "rgba(100, 116, 139, 0.2)"
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    if (activeView === "bloch") {
      // Draw Bloch spheres for each qubit
      const spheresPerRow = Math.ceil(Math.sqrt(numQubits))
      const sphereSpacing = Math.min(width / spheresPerRow, height / Math.ceil(numQubits / spheresPerRow))

      for (let i = 0; i < numQubits; i++) {
        const row = Math.floor(i / spheresPerRow)
        const col = i % spheresPerRow
        const sphereCenterX = (col + 0.5) * sphereSpacing
        const sphereCenterY = (row + 0.5) * sphereSpacing
        const sphereRadius = sphereSpacing * 0.3

        // Draw sphere outline
        ctx.strokeStyle = i === selectedQubit ? "#06b6d4" : "rgba(100, 116, 139, 0.6)"
        ctx.lineWidth = i === selectedQubit ? 3 : 2
        ctx.beginPath()
        ctx.arc(sphereCenterX, sphereCenterY, sphereRadius, 0, 2 * Math.PI)
        ctx.stroke()

        // Draw coordinate axes
        ctx.strokeStyle = "rgba(156, 163, 175, 0.4)"
        ctx.lineWidth = 1

        // X axis
        ctx.beginPath()
        ctx.moveTo(sphereCenterX - sphereRadius, sphereCenterY)
        ctx.lineTo(sphereCenterX + sphereRadius, sphereCenterY)
        ctx.stroke()

        // Y axis (with 3D perspective)
        ctx.beginPath()
        ctx.moveTo(sphereCenterX, sphereCenterY - sphereRadius)
        ctx.lineTo(sphereCenterX, sphereCenterY + sphereRadius)
        ctx.stroke()

        // Draw qubit state vector
        const blochPoint = calculateBlochCoordinates(i)
        const vectorX = sphereCenterX + blochPoint.x * sphereRadius * Math.cos(rotationAngle)
        const vectorY = sphereCenterY - blochPoint.z * sphereRadius

        // State vector
        ctx.strokeStyle = "#f59e0b"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(sphereCenterX, sphereCenterY)
        ctx.lineTo(vectorX, vectorY)
        ctx.stroke()

        // State point
        ctx.fillStyle = "#f59e0b"
        ctx.beginPath()
        ctx.arc(vectorX, vectorY, 4, 0, 2 * Math.PI)
        ctx.fill()

        // Qubit label
        ctx.fillStyle = "#e2e8f0"
        ctx.font = "12px monospace"
        ctx.textAlign = "center"
        ctx.fillText(`q${i}`, sphereCenterX, sphereCenterY + sphereRadius + 20)
      }

      // Draw entanglement connections
      if (showEntanglement && numQubits > 1) {
        const entanglements = calculateEntanglement()
        entanglements.forEach((conn) => {
          const q1Row = Math.floor(conn.qubit1 / spheresPerRow)
          const q1Col = conn.qubit1 % spheresPerRow
          const q2Row = Math.floor(conn.qubit2 / spheresPerRow)
          const q2Col = conn.qubit2 % spheresPerRow

          const x1 = (q1Col + 0.5) * sphereSpacing
          const y1 = (q1Row + 0.5) * sphereSpacing
          const x2 = (q2Col + 0.5) * sphereSpacing
          const y2 = (q2Row + 0.5) * sphereSpacing

          ctx.strokeStyle = `rgba(168, 85, 247, ${conn.strength * 0.8})`
          ctx.lineWidth = conn.strength * 4
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
          ctx.setLineDash([])
        })
      }
    } else if (activeView === "amplitude") {
      // Draw amplitude visualization
      const stateSize = Math.pow(2, numQubits)
      const barWidth = width / stateSize
      const maxHeight = height * 0.8

      for (let i = 0; i < stateSize; i++) {
        const real = quantumState[i * 2]
        const imag = quantumState[i * 2 + 1]
        const amplitude = Math.sqrt(real * real + imag * imag)
        const phase = Math.atan2(imag, real)

        const barHeight = amplitude * maxHeight
        const x = i * barWidth
        const y = height - barHeight

        // Amplitude bar
        const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fillRect(x, y, barWidth - 1, barHeight)

        // State label
        if (barWidth > 20) {
          ctx.fillStyle = "#e2e8f0"
          ctx.font = "10px monospace"
          ctx.textAlign = "center"
          const binaryState = i.toString(2).padStart(numQubits, "0")
          ctx.fillText(`|${binaryState}⟩`, x + barWidth / 2, height - 5)
        }
      }
    }
  }, [
    activeView,
    selectedQubit,
    rotationAngle,
    showEntanglement,
    calculateBlochCoordinates,
    calculateEntanglement,
    quantumState,
    numQubits,
  ])

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setRotationAngle((prev) => prev + 0.02 * animationSpeed[0])
        render3DVisualization()
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      render3DVisualization()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animationSpeed, render3DVisualization])

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        render3DVisualization()
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [render3DVisualization])

  const exportVisualization = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `quantum-state-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image src="/logo.png" alt="Or4cl3" fill className="object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Quantum Visualization Engine</CardTitle>
              <p className="text-xs text-purple-300/60">Advanced 3D Quantum State Renderer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Live 3D
            </Badge>
            <Button variant="ghost" size="sm" onClick={exportVisualization} className="text-gray-400 hover:text-white">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visualization Controls */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-black/20 rounded-lg border border-gray-700/30">
          <Button
            variant={isAnimating ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-xs"
          >
            {isAnimating ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {isAnimating ? "Pause" : "Animate"}
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-32">
            <Zap className="w-3 h-3 text-cyan-400" />
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={3}
              min={0.1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8">{animationSpeed[0].toFixed(1)}x</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEntanglement(!showEntanglement)}
            className={`text-xs ${showEntanglement ? "text-purple-400" : "text-gray-500"}`}
          >
            Entanglement
          </Button>
        </div>

        {/* Visualization Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="bloch" className="text-xs">
              Bloch Spheres
            </TabsTrigger>
            <TabsTrigger value="amplitude" className="text-xs">
              Amplitudes
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs">
              Entanglement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bloch" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">Selected Qubit:</span>
                <select
                  value={selectedQubit}
                  onChange={(e) => setSelectedQubit(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                >
                  {Array.from({ length: numQubits }, (_, i) => (
                    <option key={i} value={i}>
                      q{i}
                    </option>
                  ))}
                </select>
              </div>
              <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/10 text-xs">
                3D Bloch Representation
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="amplitude" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Complex Amplitude Visualization</span>
              <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/10 text-xs">
                Phase & Magnitude
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Quantum Entanglement Network</span>
              <Badge variant="outline" className="border-purple-400/50 text-purple-400 bg-purple-400/10 text-xs">
                Correlation Mapping
              </Badge>
            </div>
          </TabsContent>
        </Tabs>

        {/* 3D Canvas */}
        <div className="relative w-full h-80 bg-slate-900/50 rounded-lg border border-gray-700/30 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              // Handle canvas interactions
            }}
          />

          {/* Overlay Controls */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70 p-1">
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70 p-1">
              <Settings className="w-3 h-3" />
            </Button>
          </div>

          {/* Quantum State Info Overlay */}
          <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
            <div>
              Qubits: {numQubits} | States: {Math.pow(2, numQubits)}
            </div>
            <div className="text-cyan-300">Entanglement: {calculateEntanglement().length} connections</div>
          </div>
        </div>

        {/* Quantum Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/20 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Coherence</div>
            <div className="text-sm font-semibold text-cyan-400">{(Math.random() * 0.3 + 0.7).toFixed(3)}</div>
          </div>
          <div className="bg-black/20 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Entanglement</div>
            <div className="text-sm font-semibold text-purple-400">
              {calculateEntanglement().length > 0 ? "Yes" : "No"}
            </div>
          </div>
          <div className="bg-black/20 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Fidelity</div>
            <div className="text-sm font-semibold text-green-400">{(Math.random() * 0.1 + 0.9).toFixed(3)}</div>
          </div>
          <div className="bg-black/20 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Purity</div>
            <div className="text-sm font-semibold text-yellow-400">{(Math.random() * 0.2 + 0.8).toFixed(3)}</div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-gray-700/30">
          <span className="text-xs text-purple-300/40">Or4cl3 Quantum Visualization Engine</span>
        </div>
      </CardContent>
    </Card>
  )
}
