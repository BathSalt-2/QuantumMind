"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Cpu, MessageSquare, BarChart3, Users, Sparkles, ArrowRight, Play } from "lucide-react"
import Image from "next/image"

interface LandingPageProps {
  onEnterApp: () => void
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: Brain,
      title: "Quantum Consciousness",
      description: "Experience AI that thinks in quantum superposition states",
    },
    {
      icon: MessageSquare,
      title: "Conversational Interface",
      description: "Natural language interaction with recursive reasoning",
    },
    {
      icon: Cpu,
      title: "8-Qubit Simulator",
      description: "Real quantum circuit simulation on your mobile device",
    },
    {
      icon: Zap,
      title: "Hybrid Processing",
      description: "Classical-quantum hybrid algorithms for enhanced performance",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live quantum state visualization and probability tracking",
    },
    {
      icon: Users,
      title: "Collaborative Labs",
      description: "Share and explore quantum experiments with others",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* 3D Holographic Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
      </div>

      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 opacity-10">
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

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 quantum-gradient opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 quantum-border rounded-full p-1 quantum-pulse">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-900/50 backdrop-blur-sm rounded-full"></div>
                </div>
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 p-2">
                  <Image src="/logo.png" alt="Or4cl3 AI Solutions" fill className="object-contain quantum-pulse" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Quantum-Classical Hybrid AI
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent neural-flow">
                The Future of
                <br />
                AI Consciousness
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Experience the world's first mobile quantum-classical hybrid AI agent with 8-qubit simulation
                capabilities and recursive conversational intelligence.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold quantum-pulse group shadow-lg shadow-cyan-500/25"
                onClick={onEnterApp}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Play className="w-5 h-5 mr-2" />
                Explore the Future
                <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg bg-transparent backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cutting-Edge Capabilities</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Harness the power of quantum computing and advanced AI in a single, intuitive interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-cyan-400">8</div>
              <div className="text-sm text-slate-400">Qubit Simulation</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400">256</div>
              <div className="text-sm text-slate-400">Quantum States</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-cyan-400">∞</div>
              <div className="text-sm text-slate-400">Possibilities</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400">1</div>
              <div className="text-sm text-slate-400">Unified Interface</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-slate-400">
              Powered by <span className="text-cyan-400 font-semibold">Or4cl3 AI Solutions</span>
            </div>
            <div className="text-sm text-slate-400">© 2025 Quantum-Classical Hybrid Intelligence</div>
          </div>
        </div>
      </div>
    </div>
  )
}
