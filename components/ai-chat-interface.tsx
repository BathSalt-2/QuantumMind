"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Brain } from "lucide-react"
import Image from "next/image"
import { memorySystem } from "@/lib/memory-system"
import { MemoryInterface } from "@/components/memory-interface"

interface AIChatInterfaceProps {
  onQuantumExperiment?: (experiment: string) => void
}

export function AIChatInterface({ onQuantumExperiment }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [showMemoryInterface, setShowMemoryInterface] = useState(false)

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsListening(true)
        }

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      // Initialize speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
      }
    }

    const context = memorySystem.getConversationContext()
    if (!context) {
      memorySystem.startNewConversation()
    }

    // Load previous conversation if exists
    const savedContext = memorySystem.getConversationContext()
    if (savedContext && savedContext.messages.length > 0) {
      const savedMessages = savedContext.messages.map((msg) => ({
        id: `${msg.timestamp}`,
        role: msg.role,
        content: msg.content,
      }))
      setMessages(savedMessages)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current && voiceEnabled) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now().toString(), role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])

    memorySystem.addMessage("user", input)

    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    try {
      const context = memorySystem.getConversationContext()
      const recentMemories = memorySystem.searchMemories(input, undefined, 3)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: context,
          memories: recentMemories,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let assistantContent = ""
      const assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" }
      setMessages((prev) => [...prev, assistantMessage])
      setIsThinking(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const data = JSON.parse(line.slice(2))
              if (data.content) {
                assistantContent += data.content
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
                )
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      if (assistantContent) {
        memorySystem.addMessage("assistant", assistantContent)
      }

      if (voiceEnabled && assistantContent) {
        setTimeout(() => speakText(assistantContent), 500)
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = "Sorry, I encountered an error. Please try again."
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage,
        },
      ])
      if (voiceEnabled) {
        speakText(errorMessage)
      }
    } finally {
      setIsLoading(false)
      setIsThinking(false)
    }
  }

  const suggestedQuestions = [
    "Explain quantum superposition with a simple example",
    "How does quantum entanglement work?",
    "Design a quantum circuit for Grover's algorithm",
    "What are the advantages of quantum-classical hybrid systems?",
    "Help me understand quantum error correction",
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="relative w-8 h-8">
          <Image src="/logo.png" alt="Or4cl3 AI" fill className="object-contain drop-shadow-lg" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-sm"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">Or4cl3 Quantum AI</h3>
            <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 bg-cyan-400/10 text-xs px-1.5 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              Hybrid
            </Badge>
            {speechSupported && (
              <Badge
                variant="outline"
                className="border-purple-400/50 text-purple-400 bg-purple-400/10 text-xs px-1.5 py-0.5"
              >
                {isListening ? "🎤 Listening" : isSpeaking ? "🔊 Speaking" : "🎙️ Voice Ready"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400">Powered by Or4cl3 AI Solutions</p>
        </div>
        {speechSupported && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMemoryInterface(true)}
              className="p-2 text-purple-400 hover:bg-purple-400/10"
            >
              <Brain className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoice}
              className={`p-2 ${voiceEnabled ? "text-cyan-400 hover:bg-cyan-400/10" : "text-gray-500 hover:bg-gray-700/50"}`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        )}
        {(isLoading || isThinking) && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image src="/logo.png" alt="Or4cl3 AI" fill className="object-contain drop-shadow-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-md animate-pulse"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Welcome to Or4cl3</h3>
              <p className="text-gray-400 mb-2">Your quantum-classical hybrid AI assistant</p>
              {speechSupported && (
                <p className="text-xs text-cyan-300/60 mb-2">
                  🎙️ Voice interface enabled - speak or type your questions
                </p>
              )}
              <p className="text-xs text-purple-300/60 mb-6">Powered by Or4cl3 AI Solutions</p>

              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">Try asking:</p>
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="block w-full text-left text-xs border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 bg-transparent transition-all duration-200"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image src="/logo.png" alt="Or4cl3" fill className="object-contain rounded-full" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full"></div>
                </div>
              )}

              <Card
                className={`max-w-[80%] p-3 transition-all duration-200 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-cyan-600/90 to-cyan-700/90 text-white border-cyan-500/30"
                    : "bg-gray-800/80 border-gray-700/50 backdrop-blur-sm"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.role === "assistant" && (
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-700/30">
                    <span className="text-xs text-purple-300/40">Or4cl3 AI</span>
                  </div>
                )}
              </Card>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src="/logo.png" alt="Or4cl3" fill className="object-contain rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full animate-pulse"></div>
              </div>
              <Card className="bg-gray-800/80 border-gray-700/50 backdrop-blur-sm p-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  Or4cl3 is processing...
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/30 to-black/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          {speechSupported && (
            <Button
              type="button"
              variant="outline"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`p-3 transition-all duration-200 ${
                isListening
                  ? "bg-red-600/20 border-red-500/50 text-red-400 animate-pulse"
                  : "border-gray-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              speechSupported ? "Speak or type your question..." : "Ask about quantum computing, AI, or anything..."
            }
            className="flex-1 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs text-purple-300/40">Powered by Or4cl3 AI Solutions</span>
          {speechSupported && voiceEnabled && (
            <span className="text-xs text-cyan-300/40 ml-2">• Voice Interface Active</span>
          )}
        </div>
      </div>

      {/* Memory Interface */}
      <MemoryInterface isOpen={showMemoryInterface} onClose={() => setShowMemoryInterface(false)} />
    </div>
  )
}
