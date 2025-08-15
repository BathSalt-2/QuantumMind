"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Cpu, Zap } from "lucide-react"
import Image from "next/image"
import { QuantumCircuitSimulator } from "./quantum-circuit-simulator"
import { AIChatInterface } from "./ai-chat-interface"

export function QuantumAIInterface() {
  const [activeTab, setActiveTab] = useState<"chat" | "quantum">("chat")

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image src="/logo.png" alt="Quantum AI Logo" fill className="object-contain drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">QuantumMind</h1>
              <p className="text-xs text-purple-300/80">Powered by Or4cl3 AI Solutions</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs sm:text-sm px-2 py-1"
          >
            8-Qubit Ready
          </Badge>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[73px] sm:top-[81px] z-40 p-3 sm:p-4 bg-black/20 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex gap-2 max-w-7xl mx-auto">
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 gap-2 h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg"
                : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden xs:inline">AI Chat</span>
            <span className="xs:hidden">Chat</span>
          </Button>
          <Button
            variant={activeTab === "quantum" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("quantum")}
            className={`flex-1 gap-2 h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 ${
              activeTab === "quantum"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg"
                : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden xs:inline">Quantum Lab</span>
            <span className="xs:hidden">Lab</span>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto">
          <div className="h-full p-3 sm:p-4 lg:p-6">
            <Card className="h-full bg-gray-900/50 border-gray-800/50 backdrop-blur-sm overflow-hidden">
              {activeTab === "chat" ? (
                <AIChatInterface />
              ) : (
                <div className="h-full p-4">
                  <QuantumCircuitSimulator />
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 sm:p-4 text-center text-xs sm:text-sm text-purple-300/60 bg-black/20 border-t border-gray-800/30">
        <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
          <span>Quantum-Classical Hybrid Computing</span>
        </div>
      </footer>
    </div>
  )
}
