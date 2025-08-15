"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { LoadingScreen } from "@/components/loading-screen"
import { QuantumAIInterface } from "@/components/quantum-ai-interface"

type AppState = "landing" | "loading" | "app"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing")

  const handleEnterApp = () => {
    setAppState("loading")
  }

  const handleLoadingComplete = () => {
    setAppState("app")
  }

  return (
    <main className="min-h-screen">
      {appState === "landing" && <LandingPage onEnterApp={handleEnterApp} />}

      {appState === "loading" && <LoadingScreen onComplete={handleLoadingComplete} />}

      {appState === "app" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <QuantumAIInterface />
        </div>
      )}
    </main>
  )
}
