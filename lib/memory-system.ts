"use client"

export interface MemoryEntry {
  id: string
  type: "conversation" | "experiment" | "concept" | "preference" | "insight"
  timestamp: number
  content: string
  metadata: Record<string, any>
  importance: number // 0-1 scale
  tags: string[]
  relatedEntries?: string[]
}

export interface UserProfile {
  id: string
  name?: string
  expertise: "beginner" | "intermediate" | "advanced" | "expert"
  interests: string[]
  preferences: {
    voiceEnabled: boolean
    visualizationMode: "2d" | "3d"
    explanationLevel: "simple" | "detailed" | "technical"
    favoriteTopics: string[]
  }
  createdAt: number
  lastActive: number
}

export interface ConversationContext {
  sessionId: string
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>
  currentTopic?: string
  quantumExperiments: string[]
  keyInsights: string[]
}

class MemorySystem {
  private memories: Map<string, MemoryEntry> = new Map()
  private userProfile: UserProfile | null = null
  private conversationContext: ConversationContext | null = null
  private readonly STORAGE_KEY = "or4cl3-memory"
  private readonly PROFILE_KEY = "or4cl3-profile"
  private readonly CONTEXT_KEY = "or4cl3-context"

  constructor() {
    this.loadFromStorage()
  }

  // Memory Management
  addMemory(entry: Omit<MemoryEntry, "id" | "timestamp">): string {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const memory: MemoryEntry = {
      ...entry,
      id,
      timestamp: Date.now(),
    }

    this.memories.set(id, memory)
    this.saveToStorage()
    return id
  }

  getMemory(id: string): MemoryEntry | undefined {
    return this.memories.get(id)
  }

  searchMemories(query: string, type?: MemoryEntry["type"], limit = 10): MemoryEntry[] {
    const queryLower = query.toLowerCase()
    const results: MemoryEntry[] = []

    for (const memory of this.memories.values()) {
      if (type && memory.type !== type) continue

      const contentMatch = memory.content.toLowerCase().includes(queryLower)
      const tagMatch = memory.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      const metadataMatch = JSON.stringify(memory.metadata).toLowerCase().includes(queryLower)

      if (contentMatch || tagMatch || metadataMatch) {
        results.push(memory)
      }
    }

    return results.sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp).slice(0, limit)
  }

  getRecentMemories(type?: MemoryEntry["type"], limit = 20): MemoryEntry[] {
    const memories = Array.from(this.memories.values())
      .filter((m) => !type || m.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    return memories
  }

  deleteMemory(id: string): boolean {
    const deleted = this.memories.delete(id)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  // User Profile Management
  createUserProfile(profile: Omit<UserProfile, "id" | "createdAt" | "lastActive">): UserProfile {
    const userProfile: UserProfile = {
      ...profile,
      id: `user_${Date.now()}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
    }

    this.userProfile = userProfile
    this.saveToStorage()
    return userProfile
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!this.userProfile) return null

    this.userProfile = {
      ...this.userProfile,
      ...updates,
      lastActive: Date.now(),
    }

    this.saveToStorage()
    return this.userProfile
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile
  }

  // Conversation Context Management
  startNewConversation(): ConversationContext {
    const context: ConversationContext = {
      sessionId: `session_${Date.now()}`,
      messages: [],
      quantumExperiments: [],
      keyInsights: [],
    }

    this.conversationContext = context
    this.saveToStorage()
    return context
  }

  addMessage(role: "user" | "assistant", content: string): void {
    if (!this.conversationContext) {
      this.startNewConversation()
    }

    this.conversationContext!.messages.push({
      role,
      content,
      timestamp: Date.now(),
    })

    // Auto-extract insights and experiments
    this.extractInsights(content, role)
    this.saveToStorage()
  }

  addQuantumExperiment(experiment: string): void {
    if (!this.conversationContext) {
      this.startNewConversation()
    }

    this.conversationContext!.quantumExperiments.push(experiment)

    // Store as memory
    this.addMemory({
      type: "experiment",
      content: experiment,
      metadata: { sessionId: this.conversationContext!.sessionId },
      importance: 0.8,
      tags: ["quantum", "experiment", "circuit"],
    })

    this.saveToStorage()
  }

  getConversationContext(): ConversationContext | null {
    return this.conversationContext
  }

  // Intelligent Context Extraction
  private extractInsights(content: string, role: "user" | "assistant"): void {
    const insightKeywords = [
      "understand",
      "learned",
      "realize",
      "discovered",
      "insight",
      "important",
      "quantum",
      "entanglement",
      "superposition",
      "measurement",
      "algorithm",
    ]

    const contentLower = content.toLowerCase()
    const hasInsight = insightKeywords.some((keyword) => contentLower.includes(keyword))

    if (hasInsight && content.length > 50) {
      this.conversationContext!.keyInsights.push(content)

      // Store as memory
      this.addMemory({
        type: "insight",
        content,
        metadata: {
          role,
          sessionId: this.conversationContext!.sessionId,
          extractedAt: Date.now(),
        },
        importance: role === "user" ? 0.9 : 0.7,
        tags: this.extractTags(content),
      })
    }
  }

  private extractTags(content: string): string[] {
    const tagPatterns = [
      { pattern: /quantum|qubit|superposition|entanglement/gi, tag: "quantum" },
      { pattern: /circuit|gate|hadamard|cnot|pauli/gi, tag: "circuit" },
      { pattern: /algorithm|grover|shor|deutsch/gi, tag: "algorithm" },
      { pattern: /measurement|collapse|probability/gi, tag: "measurement" },
      { pattern: /bloch|sphere|visualization/gi, tag: "visualization" },
    ]

    const tags: string[] = []
    for (const { pattern, tag } of tagPatterns) {
      if (pattern.test(content)) {
        tags.push(tag)
      }
    }

    return tags
  }

  // Contextual Recommendations
  getContextualRecommendations(): string[] {
    const recommendations: string[] = []
    const recentMemories = this.getRecentMemories("conversation", 10)
    const experiments = this.getRecentMemories("experiment", 5)

    // Recommend based on recent topics
    const topics = new Set<string>()
    recentMemories.forEach((memory) => {
      memory.tags.forEach((tag) => topics.add(tag))
    })

    if (topics.has("quantum") && !topics.has("entanglement")) {
      recommendations.push("Explore quantum entanglement concepts")
    }

    if (experiments.length > 0 && !topics.has("algorithm")) {
      recommendations.push("Try implementing a quantum algorithm")
    }

    if (topics.has("circuit") && !topics.has("visualization")) {
      recommendations.push("Visualize your quantum circuits in 3D")
    }

    return recommendations.slice(0, 3)
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.memories.entries())))
      if (this.userProfile) {
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(this.userProfile))
      }
      if (this.conversationContext) {
        localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(this.conversationContext))
      }
    } catch (error) {
      console.warn("Failed to save to localStorage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      // Load memories
      const memoriesData = localStorage.getItem(this.STORAGE_KEY)
      if (memoriesData) {
        const entries = JSON.parse(memoriesData)
        this.memories = new Map(entries)
      }

      // Load user profile
      const profileData = localStorage.getItem(this.PROFILE_KEY)
      if (profileData) {
        this.userProfile = JSON.parse(profileData)
      }

      // Load conversation context
      const contextData = localStorage.getItem(this.CONTEXT_KEY)
      if (contextData) {
        this.conversationContext = JSON.parse(contextData)
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error)
    }
  }

  // Export/Import
  exportMemories(): string {
    return JSON.stringify({
      memories: Array.from(this.memories.entries()),
      profile: this.userProfile,
      context: this.conversationContext,
      exportedAt: Date.now(),
    })
  }

  importMemories(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.memories) {
        this.memories = new Map(parsed.memories)
      }
      if (parsed.profile) {
        this.userProfile = parsed.profile
      }
      if (parsed.context) {
        this.conversationContext = parsed.context
      }
      this.saveToStorage()
      return true
    } catch (error) {
      console.error("Failed to import memories:", error)
      return false
    }
  }

  // Analytics
  getMemoryStats(): {
    totalMemories: number
    memoryTypes: Record<string, number>
    averageImportance: number
    oldestMemory?: number
    newestMemory?: number
  } {
    const memories = Array.from(this.memories.values())
    const memoryTypes: Record<string, number> = {}

    memories.forEach((memory) => {
      memoryTypes[memory.type] = (memoryTypes[memory.type] || 0) + 1
    })

    const timestamps = memories.map((m) => m.timestamp)
    const totalImportance = memories.reduce((sum, m) => sum + m.importance, 0)

    return {
      totalMemories: memories.length,
      memoryTypes,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      oldestMemory: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestMemory: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    }
  }
}

// Singleton instance
export const memorySystem = new MemorySystem()
