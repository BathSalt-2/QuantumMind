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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 quantum-gradient opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 quantum-border rounded-full p-1 quantum-pulse">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-background rounded-full"></div>
                </div>
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 p-2">
                  <Image src="/logo.png" alt="Or4cl3 AI Solutions" fill className="object-contain quantum-pulse" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Quantum-Classical Hybrid AI
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent neural-flow">
                The Future of
                <br />
                AI Consciousness
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the world's first mobile quantum-classical hybrid AI agent with 8-qubit simulation
                capabilities and recursive conversational intelligence.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold quantum-pulse group"
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
                className="border-accent text-accent hover:bg-accent/10 px-8 py-6 text-lg bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Cutting-Edge Capabilities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Harness the power of quantum computing and advanced AI in a single, intuitive interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/50"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Qubit Simulation</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-accent">256</div>
              <div className="text-sm text-muted-foreground">Quantum States</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-accent">1</div>
              <div className="text-sm text-muted-foreground">Unified Interface</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              Powered by <span className="text-accent font-semibold">Or4cl3 AI Solutions</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 Quantum-Classical Hybrid Intelligence</div>
          </div>
        </div>
      </div>
    </div>
  )
}
