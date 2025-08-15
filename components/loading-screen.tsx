"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Initializing Quantum Processors...",
    "Calibrating Neural Networks...",
    "Establishing Quantum Entanglement...",
    "Loading AI Consciousness...",
    "Synchronizing Hybrid Systems...",
    "Ready for Quantum Conversations...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2

        // Update step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length)
        setCurrentStep(Math.min(stepIndex, steps.length - 1))

        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }

        return newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete, steps.length])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center z-50 relative overflow-hidden">
      {/* 3D Holographic Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
      </div>

      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "holographic-grid 10s linear infinite",
          }}
        ></div>
      </div>

      <div className="absolute inset-0 quantum-gradient opacity-10"></div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-4">
        {/* Animated Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 quantum-border rounded-full p-1 quantum-pulse">
              <div className="w-24 h-24 bg-slate-900/50 backdrop-blur-sm rounded-full"></div>
            </div>
            <div className="relative w-24 h-24 p-2">
              <Image src="/logo.png" alt="Or4cl3 AI" fill className="object-contain quantum-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Or4cl3 AI Solutions
          </h2>
          <p className="text-slate-300 animate-pulse">{steps[currentStep]}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2 bg-slate-700" />
          <div className="text-sm text-slate-400">{progress}% Complete</div>
        </div>

        {/* Quantum Visualization */}
        <div className="flex justify-center space-x-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= (progress / 100) * 8 ? "bg-cyan-400 quantum-pulse shadow-lg shadow-cyan-400/50" : "bg-slate-600"
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
