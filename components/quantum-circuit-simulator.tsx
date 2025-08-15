"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Atom, Zap, RotateCcw } from "lucide-react"
import Image from "next/image"
import {
  initializeQuantumState,
  applySingleQubitGate,
  applyCNOTGate,
  measureQubit,
  getProbabilities,
  formatQuantumState,
  gates,
  type QuantumState,
} from "@/lib/quantum-simulator"
import { QuantumVisualizationEngine } from "./quantum-visualization-engine"

interface CircuitOperation {
  type: "single" | "cnot" | "measure"
  gate?: string
  target: number
  control?: number
  id: string
}

export function QuantumCircuitSimulator() {
  const [numQubits, setNumQubits] = useState(3)
  const [quantumState, setQuantumState] = useState<QuantumState>(() => initializeQuantumState(3))
  const [circuit, setCircuit] = useState<CircuitOperation[]>([])
  const [selectedQubit, setSelectedQubit] = useState<number | null>(null)
  const [selectedControl, setSelectedControl] = useState<number | null>(null)
  const [measurementResults, setMeasurementResults] = useState<Record<number, 0 | 1>>({})

  // Reset quantum state when number of qubits changes
  const handleQubitChange = useCallback((newNumQubits: number) => {
    setNumQubits(newNumQubits)
    setQuantumState(initializeQuantumState(newNumQubits))
    setCircuit([])
    setMeasurementResults({})
    setSelectedQubit(null)
    setSelectedControl(null)
  }, [])

  // Apply single-qubit gate
  const applySingleGate = useCallback(
    (gateName: string, target: number) => {
      if (!(gateName in gates)) return

      const gate = gates[gateName as keyof typeof gates]
      const newState = applySingleQubitGate(quantumState, gate, target, numQubits)
      setQuantumState(newState)

      const operation: CircuitOperation = {
        type: "single",
        gate: gateName,
        target,
        id: Date.now().toString(),
      }
      setCircuit((prev) => [...prev, operation])
    },
    [quantumState, numQubits],
  )

  // Apply CNOT gate
  const applyCNOT = useCallback(
    (control: number, target: number) => {
      if (control === target) return

      const newState = applyCNOTGate(quantumState, control, target, numQubits)
      setQuantumState(newState)

      const operation: CircuitOperation = {
        type: "cnot",
        control,
        target,
        id: Date.now().toString(),
      }
      setCircuit((prev) => [...prev, operation])
    },
    [quantumState, numQubits],
  )

  // Measure qubit
  const measureQubitAtIndex = useCallback(
    (target: number) => {
      const { result, newState } = measureQubit(quantumState, target, numQubits)
      setQuantumState(newState)
      setMeasurementResults((prev) => ({ ...prev, [target]: result }))

      const operation: CircuitOperation = {
        type: "measure",
        target,
        id: Date.now().toString(),
      }
      setCircuit((prev) => [...prev, operation])
    },
    [quantumState, numQubits],
  )

  // Reset circuit
  const resetCircuit = useCallback(() => {
    setQuantumState(initializeQuantumState(numQubits))
    setCircuit([])
    setMeasurementResults({})
    setSelectedQubit(null)
    setSelectedControl(null)
  }, [numQubits])

  const probabilities = getProbabilities(quantumState)
  const stateString = formatQuantumState(quantumState, numQubits)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 bg-gradient-to-br from-gray-900/50 to-black/50 border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image src="/logo.png" alt="Or4cl3" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Quantum Circuit Lab</h3>
              <p className="text-xs text-purple-300/60">Or4cl3 AI Solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs">
              <Atom className="w-3 h-3 mr-1" />
              {numQubits}Q
            </Badge>
            <Button
              onClick={resetCircuit}
              size="sm"
              variant="outline"
              className="border-red-400/50 text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-all duration-200"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Qubit Count Control */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-purple-300">Qubits: {numQubits}/8</label>
            <Badge variant="outline" className="border-purple-400/50 text-purple-400 bg-purple-400/10 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Hybrid Mode
            </Badge>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={numQubits}
            onChange={(e) => handleQubitChange(Number.parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-gray-800 rounded-lg"
          />
        </div>

        {/* Qubit Visualization */}
        <div className="space-y-2 mb-4">
          {Array.from({ length: numQubits }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Button
                size="sm"
                variant={selectedQubit === i ? "default" : "ghost"}
                onClick={() => setSelectedQubit(selectedQubit === i ? null : i)}
                className="w-12 text-xs"
              >
                q{i}
              </Button>
              <div className="flex-1 h-8 bg-slate-800 rounded border border-purple-500/20 flex items-center px-2">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    measurementResults[i] !== undefined
                      ? measurementResults[i] === 1
                        ? "bg-red-400"
                        : "bg-green-400"
                      : "bg-cyan-400"
                  }`}
                ></div>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-400 to-purple-400 mx-2"></div>
                <span className="text-xs text-cyan-300">
                  {measurementResults[i] !== undefined ? `|${measurementResults[i]}⟩` : "|ψ⟩"}
                </span>
              </div>
              {selectedQubit === i && (
                <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs">
                  Selected
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Gate Controls */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Single-Qubit Gates</h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(gates)
                .filter((g) => g !== "I")
                .map((gateName) => (
                  <Button
                    key={gateName}
                    size="sm"
                    variant="outline"
                    className="border-cyan-400 text-cyan-400 bg-transparent"
                    onClick={() => selectedQubit !== null && applySingleGate(gateName, selectedQubit)}
                    disabled={selectedQubit === null}
                  >
                    {gateName}
                  </Button>
                ))}
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          <div>
            <h4 className="text-sm font-medium text-white mb-2">Two-Qubit Gates</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedControl !== null ? "default" : "ghost"}
                  onClick={() => setSelectedControl(selectedControl === null ? selectedQubit : null)}
                  className="text-xs"
                  disabled={selectedQubit === null}
                >
                  Set Control: {selectedControl !== null ? `q${selectedControl}` : "None"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-400 text-purple-400 bg-transparent"
                  onClick={() => {
                    if (selectedControl !== null && selectedQubit !== null) {
                      applyCNOT(selectedControl, selectedQubit)
                      setSelectedControl(null)
                    }
                  }}
                  disabled={selectedControl === null || selectedQubit === null}
                >
                  CNOT
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          <div>
            <h4 className="text-sm font-medium text-white mb-2">Measurement</h4>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-400 text-yellow-400 bg-transparent"
              onClick={() => selectedQubit !== null && measureQubitAtIndex(selectedQubit)}
              disabled={selectedQubit === null}
            >
              Measure Selected Qubit
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Quantum Visualization Engine */}
      <QuantumVisualizationEngine
        quantumState={quantumState.amplitudes}
        numQubits={numQubits}
        onStateChange={(newState) => {
          // Handle state changes from visualization
        }}
      />

      {/* Quantum State Display */}
      <Card className="p-4 bg-gradient-to-br from-gray-900/50 to-black/50 border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold text-white">Quantum State Vector</h4>
          <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs">
            Live
          </Badge>
        </div>
        <div className="text-xs text-purple-300 font-mono break-all mb-3 p-2 bg-black/30 rounded border border-gray-700/30">
          |ψ⟩ = {stateString}
        </div>

        <h4 className="text-sm font-semibold text-white mb-2">Probability Distribution</h4>
        <div className="space-y-1">
          {probabilities.map((prob, i) => {
            if (prob < 1e-10) return null
            const binaryState = i.toString(2).padStart(numQubits, "0")
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-cyan-300 font-mono w-16">|{binaryState}⟩</span>
                <div className="flex-1 bg-gray-800/50 rounded h-2 overflow-hidden border border-gray-700/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
                <span className="text-xs text-purple-300 w-12">{(prob * 100).toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-700/30">
          <span className="text-xs text-purple-300/40">Or4cl3 Quantum Engine</span>
        </div>
      </Card>

      {/* Circuit History */}
      {circuit.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-gray-900/50 to-black/50 border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">Circuit Operations</h4>
            <Badge variant="outline" className="border-gray-500/50 text-gray-400 bg-gray-500/10 text-xs">
              {circuit.length} ops
            </Badge>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {circuit.map((op, i) => (
              <div key={op.id} className="text-xs text-purple-300 font-mono p-1 bg-black/20 rounded">
                {i + 1}. {op.type === "single" && `${op.gate} q${op.target}`}
                {op.type === "cnot" && `CNOT q${op.control} → q${op.target}`}
                {op.type === "measure" && `Measure q${op.target}`}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
