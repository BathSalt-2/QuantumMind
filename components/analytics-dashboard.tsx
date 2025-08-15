"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Zap,
  Brain,
  Clock,
  Target,
  Download,
  RefreshCw,
  Cpu,
  MessageSquare,
  Award,
} from "lucide-react"
import {
  analyticsSystem,
  type QuantumMetrics,
  type AIMetrics,
  type UserEngagementMetrics,
  type PerformanceMetrics,
} from "@/lib/analytics-system"
import Image from "next/image"

interface AnalyticsDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics | null>(null)
  const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null)
  const [engagementMetrics, setEngagementMetrics] = useState<UserEngagementMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ timestamp: number; value: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAnalytics()
    }
  }, [isOpen, timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Simulate loading delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      setQuantumMetrics(analyticsSystem.getQuantumMetrics(timeRange))
      setAIMetrics(analyticsSystem.getAIMetrics(timeRange))
      setEngagementMetrics(analyticsSystem.getUserEngagementMetrics(timeRange))
      setPerformanceMetrics(analyticsSystem.getPerformanceMetrics())
      setTimeSeriesData(analyticsSystem.getTimeSeriesData("experiments", timeRange))
    } finally {
      setIsLoading(false)
    }
  }

  const exportAnalytics = () => {
    const data = analyticsSystem.exportAnalytics()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `or4cl3-analytics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-gradient-to-br from-gray-900/95 to-black/95 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="Or4cl3" fill className="object-contain" />
              </div>
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Advanced Analytics Dashboard
                </CardTitle>
                <p className="text-xs text-purple-300/60">Real-time Insights & Performance Metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-24 bg-gray-800/50 border-gray-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="24h">24H</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={loadAnalytics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={exportAnalytics}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="quantum" className="text-xs">
                Quantum
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI & Chat
              </TabsTrigger>
              <TabsTrigger value="engagement" className="text-xs">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Experiments"
                  value={formatNumber(quantumMetrics?.totalExperiments || 0)}
                  icon={<Zap className="w-5 h-5 text-cyan-400" />}
                  trend="+12%"
                  trendUp={true}
                />
                <MetricCard
                  title="AI Conversations"
                  value={formatNumber(aiMetrics?.totalConversations || 0)}
                  icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
                  trend="+8%"
                  trendUp={true}
                />
                <MetricCard
                  title="Active Sessions"
                  value={formatNumber(engagementMetrics?.dailyActiveUsers || 0)}
                  icon={<Users className="w-5 h-5 text-green-400" />}
                  trend="+15%"
                  trendUp={true}
                />
                <MetricCard
                  title="System Uptime"
                  value={formatPercentage(performanceMetrics?.uptime || 0)}
                  icon={<Activity className="w-5 h-5 text-yellow-400" />}
                  trend="99.9%"
                  trendUp={true}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Experiment Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-end justify-between gap-1">
                      {timeSeriesData.slice(-20).map((point, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t flex-1 min-w-2"
                          style={{
                            height: `${Math.max((point.value / Math.max(...timeSeriesData.map((p) => p.value))) * 100, 5)}%`,
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Feature Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(engagementMetrics?.featureUsage || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([feature, usage]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{feature}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-400 h-2 rounded-full"
                                  style={{
                                    width: `${(usage / Math.max(...Object.values(engagementMetrics?.featureUsage || {}))) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-white w-8">{usage}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-green-400">
                        {formatPercentage(
                          quantumMetrics?.totalExperiments
                            ? quantumMetrics.successfulExperiments / quantumMetrics.totalExperiments
                            : 0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Response Time:</span>
                      <span className="text-cyan-400">{formatDuration(aiMetrics?.responseTime || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Voice Usage:</span>
                      <span className="text-purple-400">{formatPercentage(aiMetrics?.voiceInteractionRate || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Top Quantum Gates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(quantumMetrics?.mostUsedGates || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([gate, count]) => (
                          <div key={gate} className="flex justify-between text-sm">
                            <span className="text-gray-300">{gate}</span>
                            <Badge variant="outline" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">AI Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(aiMetrics?.mostDiscussedTopics || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([topic, count]) => (
                          <div key={topic} className="flex justify-between text-sm">
                            <span className="text-gray-300 capitalize">{topic}</span>
                            <Badge variant="outline" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quantum" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Experiments"
                  value={formatNumber(quantumMetrics?.totalExperiments || 0)}
                  icon={<Zap className="w-5 h-5 text-cyan-400" />}
                />
                <MetricCard
                  title="Success Rate"
                  value={formatPercentage(
                    quantumMetrics?.totalExperiments
                      ? quantumMetrics.successfulExperiments / quantumMetrics.totalExperiments
                      : 0,
                  )}
                  icon={<Target className="w-5 h-5 text-green-400" />}
                />
                <MetricCard
                  title="Avg Complexity"
                  value={quantumMetrics?.averageCircuitComplexity.toFixed(1) || "0"}
                  icon={<Cpu className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                  title="Avg Execution"
                  value={formatDuration(quantumMetrics?.averageExecutionTime || 0)}
                  icon={<Clock className="w-5 h-5 text-yellow-400" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Gate Usage Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(quantumMetrics?.mostUsedGates || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([gate, count]) => (
                          <div key={gate} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{gate}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-cyan-400 h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(quantumMetrics?.mostUsedGates || {}))) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-white w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Qubit Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(quantumMetrics?.qubitUtilization || {})
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([qubits, count]) => (
                          <div key={qubits} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{qubits} Qubits</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-400 h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(quantumMetrics?.qubitUtilization || {}))) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-white w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Conversations"
                  value={formatNumber(aiMetrics?.totalConversations || 0)}
                  icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                  title="Avg Length"
                  value={aiMetrics?.averageConversationLength.toFixed(1) || "0"}
                  icon={<Brain className="w-5 h-5 text-cyan-400" />}
                />
                <MetricCard
                  title="Response Time"
                  value={formatDuration(aiMetrics?.responseTime || 0)}
                  icon={<Clock className="w-5 h-5 text-yellow-400" />}
                />
                <MetricCard
                  title="Voice Usage"
                  value={formatPercentage(aiMetrics?.voiceInteractionRate || 0)}
                  icon={<Activity className="w-5 h-5 text-green-400" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Discussion Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(aiMetrics?.mostDiscussedTopics || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([topic, count]) => (
                          <div key={topic} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 capitalize">{topic}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-400 h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(aiMetrics?.mostDiscussedTopics || {}))) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-white w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">AI Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">User Satisfaction:</span>
                        <span className="text-green-400">{formatPercentage(aiMetrics?.userSatisfaction || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Memory Utilization:</span>
                        <span className="text-cyan-400">{formatPercentage(aiMetrics?.memoryUtilization || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Voice Interaction Rate:</span>
                        <span className="text-purple-400">
                          {formatPercentage(aiMetrics?.voiceInteractionRate || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Active Users"
                  value={formatNumber(engagementMetrics?.dailyActiveUsers || 0)}
                  icon={<Users className="w-5 h-5 text-green-400" />}
                />
                <MetricCard
                  title="Session Duration"
                  value={formatDuration(engagementMetrics?.sessionDuration || 0)}
                  icon={<Clock className="w-5 h-5 text-yellow-400" />}
                />
                <MetricCard
                  title="Retention Rate"
                  value={formatPercentage(engagementMetrics?.retentionRate || 0)}
                  icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
                />
                <MetricCard
                  title="Collaboration"
                  value={formatPercentage(engagementMetrics?.collaborationRate || 0)}
                  icon={<Award className="w-5 h-5 text-purple-400" />}
                />
              </div>

              <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Feature Usage Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(engagementMetrics?.featureUsage || {})
                      .sort(([, a], [, b]) => b - a)
                      .map(([feature, usage]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{feature}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                                style={{
                                  width: `${(usage / Math.max(...Object.values(engagementMetrics?.featureUsage || {}))) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-white w-12">{usage}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="System Latency"
                  value={formatDuration(performanceMetrics?.systemLatency || 0)}
                  icon={<Activity className="w-5 h-5 text-yellow-400" />}
                />
                <MetricCard
                  title="Quantum Speed"
                  value={formatDuration(performanceMetrics?.quantumSimulationSpeed || 0)}
                  icon={<Zap className="w-5 h-5 text-cyan-400" />}
                />
                <MetricCard
                  title="Memory Usage"
                  value={formatPercentage(performanceMetrics?.memoryUsage || 0)}
                  icon={<Cpu className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                  title="Error Rate"
                  value={formatPercentage(performanceMetrics?.errorRate || 0)}
                  icon={<Target className="w-5 h-5 text-red-400" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Uptime</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-400 h-2 rounded-full"
                              style={{ width: `${(performanceMetrics?.uptime || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-400">
                            {formatPercentage(performanceMetrics?.uptime || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Memory Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-400 h-2 rounded-full"
                              style={{ width: `${(performanceMetrics?.memoryUsage || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-purple-400">
                            {formatPercentage(performanceMetrics?.memoryUsage || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Error Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-400 h-2 rounded-full"
                              style={{ width: `${(performanceMetrics?.errorRate || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-red-400">
                            {formatPercentage(performanceMetrics?.errorRate || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">AI Response:</span>
                        <span className="text-cyan-400">{formatDuration(performanceMetrics?.aiResponseTime || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Quantum Simulation:</span>
                        <span className="text-purple-400">
                          {formatDuration(performanceMetrics?.quantumSimulationSpeed || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">System Latency:</span>
                        <span className="text-yellow-400">
                          {formatDuration(performanceMetrics?.systemLatency || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end pt-4 border-t border-gray-700/30">
            <span className="text-xs text-purple-300/40">Or4cl3 Analytics Engine</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Component
function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="bg-gray-800/30 border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400">{title}</div>
          {icon}
        </div>
        <div className="text-xl font-semibold text-white mb-1">{value}</div>
        {trend && (
          <div className={`text-xs flex items-center gap-1 ${trendUp ? "text-green-400" : "text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${trendUp ? "" : "rotate-180"}`} />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
