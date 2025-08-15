"use client"

export interface AnalyticsEvent {
  id: string
  type: "quantum_experiment" | "ai_conversation" | "voice_interaction" | "collaboration" | "learning"
  timestamp: number
  userId: string
  sessionId: string
  data: Record<string, any>
  metadata: {
    duration?: number
    success?: boolean
    errorType?: string
    performance?: number
  }
}

export interface QuantumMetrics {
  totalExperiments: number
  successfulExperiments: number
  averageCircuitComplexity: number
  mostUsedGates: Record<string, number>
  averageExecutionTime: number
  errorRate: number
  qubitUtilization: Record<number, number>
}

export interface AIMetrics {
  totalConversations: number
  averageConversationLength: number
  mostDiscussedTopics: Record<string, number>
  responseTime: number
  userSatisfaction: number
  voiceInteractionRate: number
  memoryUtilization: number
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number
  sessionDuration: number
  featureUsage: Record<string, number>
  retentionRate: number
  collaborationRate: number
  challengeParticipation: number
}

export interface PerformanceMetrics {
  systemLatency: number
  quantumSimulationSpeed: number
  aiResponseTime: number
  memoryUsage: number
  errorRate: number
  uptime: number
}

class AnalyticsSystem {
  private events: AnalyticsEvent[] = []
  private readonly STORAGE_KEY = "or4cl3-analytics"
  private readonly MAX_EVENTS = 10000

  constructor() {
    this.loadFromStorage()
    this.startPerformanceMonitoring()
  }

  // Event Tracking
  trackEvent(type: AnalyticsEvent["type"], data: Record<string, any>, metadata: AnalyticsEvent["metadata"] = {}): void {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      userId: "user", // In a real app, this would be the actual user ID
      sessionId: this.getSessionId(),
      data,
      metadata,
    }

    this.events.push(event)

    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS)
    }

    this.saveToStorage()
  }

  // Quantum Analytics
  getQuantumMetrics(timeRange: "1h" | "24h" | "7d" | "30d" = "24h"): QuantumMetrics {
    const cutoff = this.getTimeRangeCutoff(timeRange)
    const quantumEvents = this.events.filter((e) => e.type === "quantum_experiment" && e.timestamp >= cutoff)

    const totalExperiments = quantumEvents.length
    const successfulExperiments = quantumEvents.filter((e) => e.metadata.success).length

    const circuitComplexities = quantumEvents.map((e) => e.data.circuitComplexity || 0).filter((c) => c > 0)
    const averageCircuitComplexity =
      circuitComplexities.length > 0 ? circuitComplexities.reduce((a, b) => a + b, 0) / circuitComplexities.length : 0

    const gateUsage: Record<string, number> = {}
    quantumEvents.forEach((e) => {
      if (e.data.gates) {
        e.data.gates.forEach((gate: string) => {
          gateUsage[gate] = (gateUsage[gate] || 0) + 1
        })
      }
    })

    const executionTimes = quantumEvents.map((e) => e.metadata.duration || 0).filter((t) => t > 0)
    const averageExecutionTime =
      executionTimes.length > 0 ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : 0

    const errorRate = totalExperiments > 0 ? (totalExperiments - successfulExperiments) / totalExperiments : 0

    const qubitUsage: Record<number, number> = {}
    quantumEvents.forEach((e) => {
      if (e.data.numQubits) {
        const qubits = e.data.numQubits
        qubitUsage[qubits] = (qubitUsage[qubits] || 0) + 1
      }
    })

    return {
      totalExperiments,
      successfulExperiments,
      averageCircuitComplexity,
      mostUsedGates: gateUsage,
      averageExecutionTime,
      errorRate,
      qubitUtilization: qubitUsage,
    }
  }

  // AI Analytics
  getAIMetrics(timeRange: "1h" | "24h" | "7d" | "30d" = "24h"): AIMetrics {
    const cutoff = this.getTimeRangeCutoff(timeRange)
    const aiEvents = this.events.filter((e) => e.type === "ai_conversation" && e.timestamp >= cutoff)
    const voiceEvents = this.events.filter((e) => e.type === "voice_interaction" && e.timestamp >= cutoff)

    const totalConversations = aiEvents.length
    const conversationLengths = aiEvents.map((e) => e.data.messageCount || 1).filter((l) => l > 0)
    const averageConversationLength =
      conversationLengths.length > 0 ? conversationLengths.reduce((a, b) => a + b, 0) / conversationLengths.length : 0

    const topicCounts: Record<string, number> = {}
    aiEvents.forEach((e) => {
      if (e.data.topics) {
        e.data.topics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1
        })
      }
    })

    const responseTimes = aiEvents.map((e) => e.metadata.duration || 0).filter((t) => t > 0)
    const responseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

    const satisfactionScores = aiEvents.map((e) => e.data.satisfaction || 0).filter((s) => s > 0)
    const userSatisfaction =
      satisfactionScores.length > 0 ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length : 0

    const voiceInteractionRate = totalConversations > 0 ? voiceEvents.length / totalConversations : 0

    return {
      totalConversations,
      averageConversationLength,
      mostDiscussedTopics: topicCounts,
      responseTime,
      userSatisfaction,
      voiceInteractionRate,
      memoryUtilization: this.getMemoryUtilization(),
    }
  }

  // User Engagement Analytics
  getUserEngagementMetrics(timeRange: "1h" | "24h" | "7d" | "30d" = "24h"): UserEngagementMetrics {
    const cutoff = this.getTimeRangeCutoff(timeRange)
    const recentEvents = this.events.filter((e) => e.timestamp >= cutoff)

    const uniqueSessions = new Set(recentEvents.map((e) => e.sessionId)).size
    const sessionDurations = this.calculateSessionDurations(recentEvents)
    const averageSessionDuration =
      sessionDurations.length > 0 ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length : 0

    const featureUsage: Record<string, number> = {}
    recentEvents.forEach((e) => {
      const feature = this.getFeatureFromEventType(e.type)
      featureUsage[feature] = (featureUsage[feature] || 0) + 1
    })

    const collaborationEvents = recentEvents.filter((e) => e.type === "collaboration")
    const collaborationRate = recentEvents.length > 0 ? collaborationEvents.length / recentEvents.length : 0

    return {
      dailyActiveUsers: uniqueSessions,
      sessionDuration: averageSessionDuration,
      featureUsage,
      retentionRate: this.calculateRetentionRate(timeRange),
      collaborationRate,
      challengeParticipation: this.getChallengeParticipation(cutoff),
    }
  }

  // Performance Analytics
  getPerformanceMetrics(): PerformanceMetrics {
    const recentEvents = this.events.filter((e) => e.timestamp >= Date.now() - 3600000) // Last hour

    const latencies = recentEvents.map((e) => e.metadata.duration || 0).filter((l) => l > 0)
    const systemLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0

    const quantumEvents = recentEvents.filter((e) => e.type === "quantum_experiment")
    const quantumTimes = quantumEvents.map((e) => e.metadata.duration || 0).filter((t) => t > 0)
    const quantumSimulationSpeed =
      quantumTimes.length > 0 ? quantumTimes.reduce((a, b) => a + b, 0) / quantumTimes.length : 0

    const aiEvents = recentEvents.filter((e) => e.type === "ai_conversation")
    const aiTimes = aiEvents.map((e) => e.metadata.duration || 0).filter((t) => t > 0)
    const aiResponseTime = aiTimes.length > 0 ? aiTimes.reduce((a, b) => a + b, 0) / aiTimes.length : 0

    const errorEvents = recentEvents.filter((e) => !e.metadata.success)
    const errorRate = recentEvents.length > 0 ? errorEvents.length / recentEvents.length : 0

    return {
      systemLatency,
      quantumSimulationSpeed,
      aiResponseTime,
      memoryUsage: this.getMemoryUsage(),
      errorRate,
      uptime: this.getUptime(),
    }
  }

  // Time Series Data
  getTimeSeriesData(
    metric: "experiments" | "conversations" | "errors" | "performance",
    timeRange: "1h" | "24h" | "7d" | "30d" = "24h",
  ): Array<{ timestamp: number; value: number }> {
    const cutoff = this.getTimeRangeCutoff(timeRange)
    const interval = this.getTimeInterval(timeRange)
    const data: Array<{ timestamp: number; value: number }> = []

    for (let time = cutoff; time <= Date.now(); time += interval) {
      const periodEvents = this.events.filter((e) => e.timestamp >= time && e.timestamp < time + interval)

      let value = 0
      switch (metric) {
        case "experiments":
          value = periodEvents.filter((e) => e.type === "quantum_experiment").length
          break
        case "conversations":
          value = periodEvents.filter((e) => e.type === "ai_conversation").length
          break
        case "errors":
          value = periodEvents.filter((e) => !e.metadata.success).length
          break
        case "performance":
          const durations = periodEvents.map((e) => e.metadata.duration || 0).filter((d) => d > 0)
          value = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
          break
      }

      data.push({ timestamp: time, value })
    }

    return data
  }

  // Helper Methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem("or4cl3-session-id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("or4cl3-session-id", sessionId)
    }
    return sessionId
  }

  private getTimeRangeCutoff(timeRange: string): number {
    const now = Date.now()
    switch (timeRange) {
      case "1h":
        return now - 3600000
      case "24h":
        return now - 86400000
      case "7d":
        return now - 604800000
      case "30d":
        return now - 2592000000
      default:
        return now - 86400000
    }
  }

  private getTimeInterval(timeRange: string): number {
    switch (timeRange) {
      case "1h":
        return 300000 // 5 minutes
      case "24h":
        return 3600000 // 1 hour
      case "7d":
        return 86400000 // 1 day
      case "30d":
        return 86400000 // 1 day
      default:
        return 3600000
    }
  }

  private calculateSessionDurations(events: AnalyticsEvent[]): number[] {
    const sessionMap = new Map<string, { start: number; end: number }>()

    events.forEach((event) => {
      const session = sessionMap.get(event.sessionId)
      if (!session) {
        sessionMap.set(event.sessionId, { start: event.timestamp, end: event.timestamp })
      } else {
        session.end = Math.max(session.end, event.timestamp)
      }
    })

    return Array.from(sessionMap.values()).map((session) => session.end - session.start)
  }

  private getFeatureFromEventType(type: AnalyticsEvent["type"]): string {
    switch (type) {
      case "quantum_experiment":
        return "Quantum Lab"
      case "ai_conversation":
        return "AI Chat"
      case "voice_interaction":
        return "Voice Interface"
      case "collaboration":
        return "Collaboration"
      case "learning":
        return "Learning"
      default:
        return "Other"
    }
  }

  private calculateRetentionRate(timeRange: string): number {
    // Simplified retention calculation
    const cutoff = this.getTimeRangeCutoff(timeRange)
    const previousCutoff = cutoff - (Date.now() - cutoff)

    const currentUsers = new Set(this.events.filter((e) => e.timestamp >= cutoff).map((e) => e.userId))
    const previousUsers = new Set(
      this.events.filter((e) => e.timestamp >= previousCutoff && e.timestamp < cutoff).map((e) => e.userId),
    )

    const retainedUsers = new Set([...currentUsers].filter((u) => previousUsers.has(u)))
    return previousUsers.size > 0 ? retainedUsers.size / previousUsers.size : 0
  }

  private getChallengeParticipation(cutoff: number): number {
    const challengeEvents = this.events.filter(
      (e) => e.type === "collaboration" && e.data.challengeId && e.timestamp >= cutoff,
    )
    return challengeEvents.length
  }

  private getMemoryUtilization(): number {
    // Simulate memory utilization based on stored data
    const memoryUsed = JSON.stringify(this.events).length
    const maxMemory = 1024 * 1024 // 1MB
    return Math.min(memoryUsed / maxMemory, 1)
  }

  private getMemoryUsage(): number {
    // Simulate current memory usage
    return Math.random() * 0.3 + 0.4 // 40-70%
  }

  private getUptime(): number {
    // Simulate uptime percentage
    return 0.995 + Math.random() * 0.004 // 99.5-99.9%
  }

  private startPerformanceMonitoring(): void {
    // Monitor performance metrics periodically
    setInterval(() => {
      this.trackEvent(
        "learning",
        {
          memoryUsage: this.getMemoryUsage(),
          uptime: this.getUptime(),
        },
        {
          performance: Math.random() * 0.2 + 0.8, // 80-100%
        },
      )
    }, 60000) // Every minute
  }

  // Storage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events))
    } catch (error) {
      console.warn("Failed to save analytics to localStorage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        this.events = JSON.parse(data)
      }
    } catch (error) {
      console.warn("Failed to load analytics from localStorage:", error)
    }
  }

  // Export
  exportAnalytics(): string {
    return JSON.stringify(
      {
        events: this.events,
        quantumMetrics: this.getQuantumMetrics("30d"),
        aiMetrics: this.getAIMetrics("30d"),
        engagementMetrics: this.getUserEngagementMetrics("30d"),
        performanceMetrics: this.getPerformanceMetrics(),
        exportedAt: Date.now(),
      },
      null,
      2,
    )
  }
}

export const analyticsSystem = new AnalyticsSystem()
