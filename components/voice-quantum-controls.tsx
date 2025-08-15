"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, Zap } from "lucide-react"

interface VoiceQuantumControlsProps {
  onVoiceCommand: (command: string) => void
  isActive?: boolean
}

export function VoiceQuantumControls({ onVoiceCommand, isActive = false }: VoiceQuantumControlsProps) {
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [lastCommand, setLastCommand] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsListening(true)
        }

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
          setLastCommand(transcript)

          // Process quantum voice commands
          if (transcript.includes("apply hadamard") || transcript.includes("add h gate")) {
            onVoiceCommand("hadamard")
          } else if (transcript.includes("apply pauli x") || transcript.includes("add x gate")) {
            onVoiceCommand("pauli-x")
          } else if (transcript.includes("apply pauli y") || transcript.includes("add y gate")) {
            onVoiceCommand("pauli-y")
          } else if (transcript.includes("apply pauli z") || transcript.includes("add z gate")) {
            onVoiceCommand("pauli-z")
          } else if (transcript.includes("apply cnot") || transcript.includes("add cnot gate")) {
            onVoiceCommand("cnot")
          } else if (transcript.includes("measure") || transcript.includes("measurement")) {
            onVoiceCommand("measure")
          } else if (transcript.includes("reset") || transcript.includes("clear circuit")) {
            onVoiceCommand("reset")
          } else if (transcript.includes("run simulation") || transcript.includes("simulate")) {
            onVoiceCommand("simulate")
          }
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onVoiceCommand])

  const toggleListening = () => {
    if (!speechSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const voiceCommands = [
    "Apply Hadamard",
    "Apply Pauli X",
    "Apply Pauli Y",
    "Apply Pauli Z",
    "Apply CNOT",
    "Measure",
    "Reset Circuit",
    "Run Simulation",
  ]

  if (!speechSupported) {
    return null
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Voice Quantum Controls</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 ${voiceEnabled ? "text-cyan-400" : "text-gray-500"}`}
            >
              {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleListening}
              disabled={!voiceEnabled}
              className={`p-2 ${
                isListening ? "text-red-400 animate-pulse" : voiceEnabled ? "text-cyan-400" : "text-gray-500"
              }`}
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {isListening && (
          <Badge variant="outline" className="border-red-400/50 text-red-400 bg-red-400/10 text-xs">
            🎤 Listening for quantum commands...
          </Badge>
        )}

        {lastCommand && <div className="text-xs text-gray-400">Last command: "{lastCommand}"</div>}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <p className="text-gray-500 font-medium">Gate Commands:</p>
            {voiceCommands.slice(0, 4).map((cmd, i) => (
              <p key={i} className="text-gray-400">
                • {cmd}
              </p>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 font-medium">Control Commands:</p>
            {voiceCommands.slice(4).map((cmd, i) => (
              <p key={i} className="text-gray-400">
                • {cmd}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
