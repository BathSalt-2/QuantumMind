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
    <div className="fixed inset-0 bg-gradient-to-br from-background via-muted to-background flex items-center justify-center z-50">
      <div className="absolute inset-0 quantum-gradient opacity-5"></div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-4">
        {/* Animated Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 quantum-border rounded-full p-1 quantum-pulse">
              <div className="w-24 h-24 bg-background rounded-full"></div>
            </div>
            <div className="relative w-24 h-24 p-2">
              <Image src="/logo.png" alt="Or4cl3 AI" fill className="object-contain quantum-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Or4cl3 AI Solutions
          </h2>
          <p className="text-muted-foreground animate-pulse">{steps[currentStep]}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2 bg-muted" />
          <div className="text-sm text-muted-foreground">{progress}% Complete</div>
        </div>

        {/* Quantum Visualization */}
        <div className="flex justify-center space-x-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= (progress / 100) * 8 ? "bg-accent quantum-pulse" : "bg-muted"
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
