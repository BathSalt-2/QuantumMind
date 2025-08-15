"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Brain, Search, Download, Upload, Trash2, Star, Clock, User, BarChart3, Lightbulb, Zap } from "lucide-react"
import { memorySystem, type MemoryEntry, type UserProfile } from "@/lib/memory-system"
import Image from "next/image"

interface MemoryInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export function MemoryInterface({ isOpen, onClose }: MemoryInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MemoryEntry[]>([])
  const [recentMemories, setRecentMemories] = useState<MemoryEntry[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [memoryStats, setMemoryStats] = useState<any>({})
  const [activeTab, setActiveTab] = useState("memories")

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = () => {
    setRecentMemories(memorySystem.getRecentMemories())
    setUserProfile(memorySystem.getUserProfile())
    setRecommendations(memorySystem.getContextualRecommendations())
    setMemoryStats(memorySystem.getMemoryStats())
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = memorySystem.searchMemories(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleDeleteMemory = (id: string) => {
    memorySystem.deleteMemory(id)
    loadData()
    if (searchQuery) {
      handleSearch()
    }
  }

  const exportMemories = () => {
    const data = memorySystem.exportMemories()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `or4cl3-memories-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (memorySystem.importMemories(data)) {
          loadData()
          alert("Memories imported successfully!")
        } else {
          alert("Failed to import memories. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTypeColor = (type: MemoryEntry["type"]) => {
    const colors = {
      conversation: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      experiment: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      concept: "bg-green-500/10 text-green-400 border-green-500/30",
      preference: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      insight: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    }
    return colors[type] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-gradient-to-br from-gray-900/95 to-black/95 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="Or4cl3" fill className="object-contain" />
              </div>
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  AI Memory System
                </CardTitle>
                <p className="text-xs text-purple-300/60">Persistent Context & Learning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs">
                {memoryStats.totalMemories || 0} Memories
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
              <TabsTrigger value="memories" className="text-xs">
                Memories
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs">
                Profile
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">
                Insights
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="memories" className="flex-1 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search memories, experiments, concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-gray-800/50 border-gray-700/50 text-white"
                />
                <Button onClick={handleSearch} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Memory List */}
              <ScrollArea className="flex-1 h-96">
                <div className="space-y-3">
                  {(searchResults.length > 0 ? searchResults : recentMemories).map((memory) => (
                    <Card key={memory.id} className="bg-gray-800/30 border-gray-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getTypeColor(memory.type)}`}>
                              {memory.type}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.round(memory.importance * 5) }, (_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMemory(memory.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-sm text-gray-300 mb-2 line-clamp-3">{memory.content}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(memory.timestamp)}
                          </div>
                          <div className="flex gap-1">
                            {memory.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="profile" className="flex-1 space-y-4">
              {userProfile ? (
                <div className="space-y-4">
                  <Card className="bg-gray-800/30 border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">User Profile</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Expertise Level</label>
                          <Badge variant="outline" className="mt-1 block w-fit">
                            {userProfile.expertise}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Last Active</label>
                          <p className="text-sm text-white">{formatTimestamp(userProfile.lastActive)}</p>
                        </div>
                      </div>

                      <Separator className="my-4 bg-gray-700/50" />

                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.interests.map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-4 bg-gray-700/50" />

                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Preferences</label>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Voice Enabled:</span>
                            <span className="text-white">{userProfile.preferences.voiceEnabled ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Visualization Mode:</span>
                            <span className="text-white">{userProfile.preferences.visualizationMode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Explanation Level:</span>
                            <span className="text-white">{userProfile.preferences.explanationLevel}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      No user profile found. Create one to enable personalized experiences.
                    </p>
                    <Button
                      onClick={() => {
                        const profile = memorySystem.createUserProfile({
                          expertise: "beginner",
                          interests: ["quantum computing", "AI"],
                          preferences: {
                            voiceEnabled: true,
                            visualizationMode: "3d",
                            explanationLevel: "detailed",
                            favoriteTopics: [],
                          },
                        })
                        setUserProfile(profile)
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="flex-1 space-y-4">
              <div className="space-y-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                    </div>
                    <div className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20"
                        >
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-200">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {memorySystem.getRecentMemories("insight").map((insight) => (
                      <Card key={insight.id} className="bg-gray-800/30 border-gray-700/50">
                        <CardContent className="p-3">
                          <p className="text-sm text-gray-300 mb-2">{insight.content}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatTimestamp(insight.timestamp)}</span>
                            <div className="flex gap-1">
                              {insight.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">{memoryStats.totalMemories || 0}</div>
                    <div className="text-xs text-gray-400">Total Memories</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">
                      {(memoryStats.averageImportance * 100 || 0).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400">Avg Importance</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">{memoryStats.memoryTypes?.experiment || 0}</div>
                    <div className="text-xs text-gray-400">Experiments</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <Lightbulb className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">{memoryStats.memoryTypes?.insight || 0}</div>
                    <div className="text-xs text-gray-400">Insights</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800/30 border-gray-700/50">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Memory Distribution</h3>
                  <div className="space-y-2">
                    {Object.entries(memoryStats.memoryTypes || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-cyan-400 h-2 rounded-full"
                              style={{
                                width: `${((count as number) / (memoryStats.totalMemories || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white w-8">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export/Import Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
            <div className="flex items-center gap-2">
              <Button onClick={exportMemories} size="sm" variant="outline" className="text-xs bg-transparent">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" className="text-xs bg-transparent" asChild>
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </span>
                </Button>
                <input type="file" accept=".json" onChange={importMemories} className="hidden" />
              </label>
            </div>
            <span className="text-xs text-purple-300/40">Or4cl3 Memory System</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
