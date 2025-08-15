"use client"

export interface QuantumExperiment {
  id: string
  title: string
  description: string
  author: string
  authorId: string
  createdAt: number
  updatedAt: number
  category: "algorithm" | "tutorial" | "research" | "challenge" | "demo"
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  tags: string[]
  circuit: {
    numQubits: number
    operations: Array<{
      type: "single" | "cnot" | "measure"
      gate?: string
      target: number
      control?: number
    }>
  }
  expectedResults?: {
    probabilities: number[]
    description: string
  }
  likes: number
  views: number
  comments: Comment[]
  isPublic: boolean
  collaborators: string[]
  version: number
  parentExperiment?: string
}

export interface Comment {
  id: string
  author: string
  authorId: string
  content: string
  timestamp: number
  likes: number
  replies: Comment[]
}

export interface ExperimentChallenge {
  id: string
  title: string
  description: string
  objective: string
  constraints: string[]
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  category: string
  reward: string
  deadline?: number
  submissions: number
  topSubmissions: Array<{
    experimentId: string
    author: string
    score: number
    timestamp: number
  }>
}

class CollaborativeExperimentSystem {
  private experiments: Map<string, QuantumExperiment> = new Map()
  private challenges: Map<string, ExperimentChallenge> = new Map()
  private readonly STORAGE_KEY = "or4cl3-experiments"
  private readonly CHALLENGES_KEY = "or4cl3-challenges"

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultExperiments()
    this.initializeDefaultChallenges()
  }

  // Experiment Management
  createExperiment(
    experiment: Omit<QuantumExperiment, "id" | "createdAt" | "updatedAt" | "likes" | "views" | "comments" | "version">,
  ): string {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newExperiment: QuantumExperiment = {
      ...experiment,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: 0,
      views: 0,
      comments: [],
      version: 1,
    }

    this.experiments.set(id, newExperiment)
    this.saveToStorage()
    return id
  }

  getExperiment(id: string): QuantumExperiment | undefined {
    const experiment = this.experiments.get(id)
    if (experiment) {
      // Increment view count
      experiment.views++
      this.experiments.set(id, experiment)
      this.saveToStorage()
    }
    return experiment
  }

  updateExperiment(id: string, updates: Partial<QuantumExperiment>): QuantumExperiment | null {
    const experiment = this.experiments.get(id)
    if (!experiment) return null

    const updatedExperiment: QuantumExperiment = {
      ...experiment,
      ...updates,
      updatedAt: Date.now(),
      version: experiment.version + 1,
    }

    this.experiments.set(id, updatedExperiment)
    this.saveToStorage()
    return updatedExperiment
  }

  deleteExperiment(id: string): boolean {
    const deleted = this.experiments.delete(id)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  // Search and Discovery
  searchExperiments(
    query: string,
    filters?: {
      category?: string
      difficulty?: string
      author?: string
      tags?: string[]
    },
  ): QuantumExperiment[] {
    const queryLower = query.toLowerCase()
    const results: QuantumExperiment[] = []

    for (const experiment of this.experiments.values()) {
      if (!experiment.isPublic) continue

      // Apply filters
      if (filters?.category && experiment.category !== filters.category) continue
      if (filters?.difficulty && experiment.difficulty !== filters.difficulty) continue
      if (filters?.author && experiment.author !== filters.author) continue
      if (filters?.tags && !filters.tags.some((tag) => experiment.tags.includes(tag))) continue

      // Text search
      const titleMatch = experiment.title.toLowerCase().includes(queryLower)
      const descriptionMatch = experiment.description.toLowerCase().includes(queryLower)
      const tagMatch = experiment.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      const authorMatch = experiment.author.toLowerCase().includes(queryLower)

      if (titleMatch || descriptionMatch || tagMatch || authorMatch) {
        results.push(experiment)
      }
    }

    return results.sort((a, b) => b.likes - a.likes || b.views - a.views)
  }

  getPopularExperiments(limit = 10): QuantumExperiment[] {
    return Array.from(this.experiments.values())
      .filter((exp) => exp.isPublic)
      .sort((a, b) => b.likes - a.likes || b.views - a.views)
      .slice(0, limit)
  }

  getRecentExperiments(limit = 10): QuantumExperiment[] {
    return Array.from(this.experiments.values())
      .filter((exp) => exp.isPublic)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }

  getExperimentsByCategory(category: string): QuantumExperiment[] {
    return Array.from(this.experiments.values())
      .filter((exp) => exp.isPublic && exp.category === category)
      .sort((a, b) => b.likes - a.likes)
  }

  // Social Features
  likeExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) return false

    experiment.likes++
    this.experiments.set(experimentId, experiment)
    this.saveToStorage()
    return true
  }

  addComment(experimentId: string, comment: Omit<Comment, "id" | "timestamp" | "likes" | "replies">): string | null {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) return null

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newComment: Comment = {
      ...comment,
      id: commentId,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    }

    experiment.comments.push(newComment)
    this.experiments.set(experimentId, experiment)
    this.saveToStorage()
    return commentId
  }

  // Challenges
  getChallenges(): ExperimentChallenge[] {
    return Array.from(this.challenges.values()).sort((a, b) => (b.deadline || 0) - (a.deadline || 0))
  }

  getChallenge(id: string): ExperimentChallenge | undefined {
    return this.challenges.get(id)
  }

  submitToChallenge(challengeId: string, experimentId: string): boolean {
    const challenge = this.challenges.get(challengeId)
    const experiment = this.experiments.get(experimentId)

    if (!challenge || !experiment) return false

    challenge.submissions++
    // Simulate scoring
    const score = Math.random() * 100

    challenge.topSubmissions.push({
      experimentId,
      author: experiment.author,
      score,
      timestamp: Date.now(),
    })

    // Keep only top 10 submissions
    challenge.topSubmissions = challenge.topSubmissions.sort((a, b) => b.score - a.score).slice(0, 10)

    this.challenges.set(challengeId, challenge)
    this.saveToStorage()
    return true
  }

  // Storage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.experiments.entries())))
      localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(Array.from(this.challenges.entries())))
    } catch (error) {
      console.warn("Failed to save experiments to localStorage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const experimentsData = localStorage.getItem(this.STORAGE_KEY)
      if (experimentsData) {
        const entries = JSON.parse(experimentsData)
        this.experiments = new Map(entries)
      }

      const challengesData = localStorage.getItem(this.CHALLENGES_KEY)
      if (challengesData) {
        const entries = JSON.parse(challengesData)
        this.challenges = new Map(entries)
      }
    } catch (error) {
      console.warn("Failed to load experiments from localStorage:", error)
    }
  }

  // Initialize default content
  private initializeDefaultExperiments(): void {
    if (this.experiments.size > 0) return

    const defaultExperiments = [
      {
        title: "Bell State Creation",
        description: "Create a maximally entangled Bell state using Hadamard and CNOT gates",
        author: "Or4cl3 Team",
        authorId: "or4cl3",
        category: "tutorial" as const,
        difficulty: "beginner" as const,
        tags: ["entanglement", "bell-state", "tutorial"],
        circuit: {
          numQubits: 2,
          operations: [
            { type: "single" as const, gate: "H", target: 0 },
            { type: "cnot" as const, target: 1, control: 0 },
          ],
        },
        expectedResults: {
          probabilities: [0.5, 0, 0, 0.5],
          description: "Equal probability of measuring |00⟩ and |11⟩ states",
        },
        isPublic: true,
        collaborators: [],
      },
      {
        title: "Quantum Superposition Demo",
        description: "Demonstrate quantum superposition using a single qubit in equal superposition",
        author: "Or4cl3 Team",
        authorId: "or4cl3",
        category: "demo" as const,
        difficulty: "beginner" as const,
        tags: ["superposition", "hadamard", "basics"],
        circuit: {
          numQubits: 1,
          operations: [{ type: "single" as const, gate: "H", target: 0 }],
        },
        expectedResults: {
          probabilities: [0.5, 0.5],
          description: "Equal probability of measuring |0⟩ and |1⟩ states",
        },
        isPublic: true,
        collaborators: [],
      },
      {
        title: "Grover's Algorithm (2-qubit)",
        description: "Implementation of Grover's search algorithm for 2 qubits",
        author: "Quantum Researcher",
        authorId: "researcher1",
        category: "algorithm" as const,
        difficulty: "advanced" as const,
        tags: ["grover", "search", "algorithm"],
        circuit: {
          numQubits: 2,
          operations: [
            { type: "single" as const, gate: "H", target: 0 },
            { type: "single" as const, gate: "H", target: 1 },
            { type: "single" as const, gate: "Z", target: 1 },
            { type: "cnot" as const, target: 1, control: 0 },
            { type: "single" as const, gate: "Z", target: 1 },
            { type: "single" as const, gate: "H", target: 0 },
            { type: "single" as const, gate: "H", target: 1 },
            { type: "single" as const, gate: "Z", target: 0 },
            { type: "single" as const, gate: "Z", target: 1 },
            { type: "cnot" as const, target: 1, control: 0 },
            { type: "single" as const, gate: "Z", target: 1 },
            { type: "single" as const, gate: "H", target: 0 },
            { type: "single" as const, gate: "H", target: 1 },
          ],
        },
        isPublic: true,
        collaborators: [],
      },
    ]

    defaultExperiments.forEach((exp) => {
      this.createExperiment(exp)
    })
  }

  private initializeDefaultChallenges(): void {
    if (this.challenges.size > 0) return

    const defaultChallenges: Omit<ExperimentChallenge, "id">[] = [
      {
        title: "Quantum Teleportation Challenge",
        description: "Implement a quantum teleportation protocol using 3 qubits",
        objective:
          "Create a circuit that can teleport the state of one qubit to another using entanglement and classical communication",
        constraints: [
          "Must use exactly 3 qubits",
          "Must include Bell state preparation",
          "Must demonstrate successful state transfer",
        ],
        difficulty: "expert",
        category: "algorithm",
        reward: "Quantum Pioneer Badge",
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        submissions: 0,
        topSubmissions: [],
      },
      {
        title: "Quantum Error Correction",
        description: "Design a simple quantum error correction scheme",
        objective: "Implement a 3-qubit bit-flip error correction code",
        constraints: [
          "Must protect against single bit-flip errors",
          "Must use syndrome measurement",
          "Must demonstrate error recovery",
        ],
        difficulty: "advanced",
        category: "research",
        reward: "Error Correction Expert Badge",
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
        submissions: 0,
        topSubmissions: [],
      },
      {
        title: "Creative Quantum Art",
        description: "Create an artistic quantum circuit that produces beautiful probability patterns",
        objective: "Design a quantum circuit that creates visually appealing probability distributions",
        constraints: [
          "Must use at least 3 qubits",
          "Focus on aesthetic probability patterns",
          "Include artistic description",
        ],
        difficulty: "intermediate",
        category: "demo",
        reward: "Quantum Artist Badge",
        deadline: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days
        submissions: 0,
        topSubmissions: [],
      },
    ]

    defaultChallenges.forEach((challenge) => {
      const id = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.challenges.set(id, { ...challenge, id })
    })
  }
}

export const collaborativeSystem = new CollaborativeExperimentSystem()
