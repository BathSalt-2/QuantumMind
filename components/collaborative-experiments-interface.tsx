"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Search,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Trophy,
  Clock,
  Star,
  Filter,
  Plus,
  Play,
  Zap,
  Target,
  Award,
} from "lucide-react"
import { collaborativeSystem, type QuantumExperiment, type ExperimentChallenge } from "@/lib/collaborative-experiments"
import Image from "next/image"

interface CollaborativeExperimentsInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onLoadExperiment?: (experiment: QuantumExperiment) => void
}

export function CollaborativeExperimentsInterface({
  isOpen,
  onClose,
  onLoadExperiment,
}: CollaborativeExperimentsInterfaceProps) {
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<QuantumExperiment[]>([])
  const [popularExperiments, setPopularExperiments] = useState<QuantumExperiment[]>([])
  const [recentExperiments, setRecentExperiments] = useState<QuantumExperiment[]>([])
  const [challenges, setChallenges] = useState<ExperimentChallenge[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<QuantumExperiment | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<ExperimentChallenge | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newExperiment, setNewExperiment] = useState({
    title: "",
    description: "",
    category: "demo" as const,
    difficulty: "beginner" as const,
    tags: "",
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = () => {
    setPopularExperiments(collaborativeSystem.getPopularExperiments())
    setRecentExperiments(collaborativeSystem.getRecentExperiments())
    setChallenges(collaborativeSystem.getChallenges())
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = collaborativeSystem.searchExperiments(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleLikeExperiment = (experimentId: string) => {
    collaborativeSystem.likeExperiment(experimentId)
    loadData()
    if (selectedExperiment?.id === experimentId) {
      setSelectedExperiment(collaborativeSystem.getExperiment(experimentId) || null)
    }
  }

  const handleLoadExperiment = (experiment: QuantumExperiment) => {
    if (onLoadExperiment) {
      onLoadExperiment(experiment)
      onClose()
    }
  }

  const handleCreateExperiment = () => {
    if (!newExperiment.title.trim() || !newExperiment.description.trim()) return

    const experimentId = collaborativeSystem.createExperiment({
      ...newExperiment,
      author: "You",
      authorId: "user",
      tags: newExperiment.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      circuit: {
        numQubits: 2,
        operations: [],
      },
      isPublic: true,
      collaborators: [],
    })

    setNewExperiment({
      title: "",
      description: "",
      category: "demo",
      difficulty: "beginner",
      tags: "",
    })
    setShowCreateForm(false)
    loadData()
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-500/10 text-green-400 border-green-500/30",
      intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      advanced: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      expert: "bg-red-500/10 text-red-400 border-red-500/30",
    }
    return colors[difficulty as keyof typeof colors] || colors.beginner
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      algorithm: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      tutorial: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      research: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      challenge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      demo: "bg-green-500/10 text-green-400 border-green-500/30",
    }
    return colors[category as keyof typeof colors] || colors.demo
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[85vh] bg-gradient-to-br from-gray-900/95 to-black/95 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="Or4cl3" fill className="object-contain" />
              </div>
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Collaborative Quantum Lab
                </CardTitle>
                <p className="text-xs text-purple-300/60">Share, Discover & Learn Together</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs">
                {popularExperiments.length} Experiments
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="discover" className="text-xs">
                Discover
              </TabsTrigger>
              <TabsTrigger value="challenges" className="text-xs">
                Challenges
              </TabsTrigger>
              <TabsTrigger value="create" className="text-xs">
                Create
              </TabsTrigger>
              <TabsTrigger value="community" className="text-xs">
                Community
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="flex-1 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search experiments, algorithms, tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-gray-800/50 border-gray-700/50 text-white"
                />
                <Button onClick={handleSearch} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-700/50 bg-transparent">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
                {/* Experiment List */}
                <div className="lg:col-span-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {/* Search Results or Popular/Recent */}
                      {searchResults.length > 0 ? (
                        <>
                          <h3 className="text-sm font-semibold text-white mb-2">Search Results</h3>
                          {searchResults.map((experiment) => (
                            <ExperimentCard
                              key={experiment.id}
                              experiment={experiment}
                              onSelect={setSelectedExperiment}
                              onLike={handleLikeExperiment}
                              onLoad={handleLoadExperiment}
                            />
                          ))}
                        </>
                      ) : (
                        <>
                          <div>
                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              Popular Experiments
                            </h3>
                            <div className="space-y-2">
                              {popularExperiments.slice(0, 3).map((experiment) => (
                                <ExperimentCard
                                  key={experiment.id}
                                  experiment={experiment}
                                  onSelect={setSelectedExperiment}
                                  onLike={handleLikeExperiment}
                                  onLoad={handleLoadExperiment}
                                />
                              ))}
                            </div>
                          </div>

                          <Separator className="bg-gray-700/50" />

                          <div>
                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-cyan-400" />
                              Recent Experiments
                            </h3>
                            <div className="space-y-2">
                              {recentExperiments.slice(0, 4).map((experiment) => (
                                <ExperimentCard
                                  key={experiment.id}
                                  experiment={experiment}
                                  onSelect={setSelectedExperiment}
                                  onLike={handleLikeExperiment}
                                  onLoad={handleLoadExperiment}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Experiment Details */}
                <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4">
                  {selectedExperiment ? (
                    <ExperimentDetails
                      experiment={selectedExperiment}
                      onLoad={handleLoadExperiment}
                      onLike={handleLikeExperiment}
                    />
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an experiment to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="flex-1 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
                <div className="lg:col-span-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Active Challenges
                      </h3>
                      {challenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} onSelect={setSelectedChallenge} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4">
                  {selectedChallenge ? (
                    <ChallengeDetails challenge={selectedChallenge} />
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a challenge to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="create" className="flex-1 space-y-4">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-cyan-400" />
                      Create New Experiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Title</label>
                      <Input
                        value={newExperiment.title}
                        onChange={(e) => setNewExperiment((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter experiment title..."
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Description</label>
                      <Textarea
                        value={newExperiment.description}
                        onChange={(e) => setNewExperiment((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your experiment..."
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Category</label>
                        <select
                          value={newExperiment.category}
                          onChange={(e) => setNewExperiment((prev) => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                        >
                          <option value="demo">Demo</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="algorithm">Algorithm</option>
                          <option value="research">Research</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Difficulty</label>
                        <select
                          value={newExperiment.difficulty}
                          onChange={(e) => setNewExperiment((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Tags (comma-separated)</label>
                      <Input
                        value={newExperiment.tags}
                        onChange={(e) => setNewExperiment((prev) => ({ ...prev, tags: e.target.value }))}
                        placeholder="quantum, entanglement, tutorial..."
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateExperiment}
                        className="bg-cyan-600 hover:bg-cyan-700 flex-1"
                        disabled={!newExperiment.title.trim() || !newExperiment.description.trim()}
                      >
                        Create Experiment
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateForm(false)} className="border-gray-700/50">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="community" className="flex-1 space-y-4">
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Community Features</h3>
                <p className="text-gray-400 mb-4">Connect with quantum computing enthusiasts worldwide</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Card className="bg-gray-800/30 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-1">Discussions</h4>
                      <p className="text-xs text-gray-400">Join quantum computing discussions</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/30 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <Share2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-1">Collaboration</h4>
                      <p className="text-xs text-gray-400">Work together on experiments</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/30 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-1">Achievements</h4>
                      <p className="text-xs text-gray-400">Earn badges and recognition</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end pt-4 border-t border-gray-700/30">
            <span className="text-xs text-purple-300/40">Or4cl3 Collaborative Quantum Lab</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function ExperimentCard({
  experiment,
  onSelect,
  onLike,
  onLoad,
}: {
  experiment: QuantumExperiment
  onSelect: (exp: QuantumExperiment) => void
  onLike: (id: string) => void
  onLoad: (exp: QuantumExperiment) => void
}) {
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-500/10 text-green-400 border-green-500/30",
      intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      advanced: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      expert: "bg-red-500/10 text-red-400 border-red-500/30",
    }
    return colors[difficulty as keyof typeof colors] || colors.beginner
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      algorithm: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      tutorial: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      research: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      challenge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      demo: "bg-green-500/10 text-green-400 border-green-500/30",
    }
    return colors[category as keyof typeof colors] || colors.demo
  }

  return (
    <Card
      className="bg-gray-800/30 border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer"
      onClick={() => onSelect(experiment)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-white line-clamp-1">{experiment.title}</h4>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onLike(experiment.id)
              }}
              className="p-1 text-red-400 hover:text-red-300"
            >
              <Heart className="w-3 h-3" />
              <span className="text-xs ml-1">{experiment.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onLoad(experiment)
              }}
              className="p-1 text-cyan-400 hover:text-cyan-300"
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{experiment.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${getCategoryColor(experiment.category)}`}>
              {experiment.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getDifficultyColor(experiment.difficulty)}`}>
              {experiment.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Eye className="w-3 h-3" />
            {experiment.views}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/30">
          <span className="text-xs text-gray-500">by {experiment.author}</span>
          <div className="flex gap-1">
            {experiment.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ExperimentDetails({
  experiment,
  onLoad,
  onLike,
}: {
  experiment: QuantumExperiment
  onLoad: (exp: QuantumExperiment) => void
  onLike: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{experiment.title}</h3>
        <p className="text-sm text-gray-300 mb-3">{experiment.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Author:</span>
          <span className="text-white">{experiment.author}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Qubits:</span>
          <span className="text-white">{experiment.circuit.numQubits}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Operations:</span>
          <span className="text-white">{experiment.circuit.operations.length}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onLoad(experiment)} className="bg-cyan-600 hover:bg-cyan-700 flex-1">
          <Play className="w-4 h-4 mr-2" />
          Load Experiment
        </Button>
        <Button
          variant="outline"
          onClick={() => onLike(experiment.id)}
          className="border-red-400/50 text-red-400 hover:bg-red-400/10"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white">Tags</h4>
        <div className="flex flex-wrap gap-1">
          {experiment.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {experiment.likes}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {experiment.views}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {experiment.comments.length}
          </div>
        </div>
        <span>v{experiment.version}</span>
      </div>
    </div>
  )
}

function ChallengeCard({
  challenge,
  onSelect,
}: {
  challenge: ExperimentChallenge
  onSelect: (challenge: ExperimentChallenge) => void
}) {
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-500/10 text-green-400 border-green-500/30",
      intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      advanced: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      expert: "bg-red-500/10 text-red-400 border-red-500/30",
    }
    return colors[difficulty as keyof typeof colors] || colors.beginner
  }

  const timeLeft = challenge.deadline ? Math.max(0, challenge.deadline - Date.now()) : 0
  const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))

  return (
    <Card
      className="bg-gray-800/30 border-gray-700/50 hover:border-yellow-500/30 transition-all cursor-pointer"
      onClick={() => onSelect(challenge)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-white line-clamp-1">{challenge.title}</h4>
          <Trophy className="w-4 h-4 text-yellow-400 ml-2" />
        </div>

        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{challenge.description}</p>

        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            {challenge.submissions}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
          </div>
          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            {challenge.reward}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function ChallengeDetails({ challenge }: { challenge: ExperimentChallenge }) {
  const timeLeft = challenge.deadline ? Math.max(0, challenge.deadline - Date.now()) : 0
  const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          {challenge.title}
        </h3>
        <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Objective</h4>
        <p className="text-sm text-gray-300">{challenge.objective}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Constraints</h4>
        <ul className="space-y-1">
          {challenge.constraints.map((constraint, index) => (
            <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
              <Target className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
              {constraint}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Difficulty:</span>
          <Badge variant="outline" className="text-xs">
            {challenge.difficulty}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Submissions:</span>
          <span className="text-white">{challenge.submissions}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Time Left:</span>
          <span className="text-white">{daysLeft > 0 ? `${daysLeft} days` : "Expired"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Reward:</span>
          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            {challenge.reward}
          </Badge>
        </div>
      </div>

      <Button className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={daysLeft <= 0}>
        <Zap className="w-4 h-4 mr-2" />
        {daysLeft > 0 ? "Accept Challenge" : "Challenge Expired"}
      </Button>

      {challenge.topSubmissions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Top Submissions</h4>
          <div className="space-y-1">
            {challenge.topSubmissions.slice(0, 3).map((submission, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{submission.author}</span>
                <span className="text-yellow-400">{submission.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
