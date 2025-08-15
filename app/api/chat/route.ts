import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, context, memories } = await req.json()

    let systemPrompt = `You are Or4cl3, an advanced quantum-classical hybrid AI agent with deep expertise in quantum computing, artificial intelligence, and recursive reasoning. You have access to an 8-qubit quantum simulator and can help users understand quantum mechanics, quantum algorithms, and quantum-classical hybrid systems.

Key capabilities:
- Quantum circuit design and simulation
- Quantum algorithm explanation (Shor's, Grover's, VQE, etc.)
- Quantum-classical hybrid optimization
- Recursive problem-solving and meta-reasoning
- Complex mathematical computations
- AI and machine learning integration

You communicate in a thoughtful, precise manner while making complex quantum concepts accessible. When discussing quantum topics, you can reference the integrated quantum simulator and suggest specific experiments or circuits to try.

Always consider multiple perspectives and use recursive reasoning to break down complex problems into manageable components.`

    if (context && context.insights && context.insights.length > 0) {
      systemPrompt += `\n\nRecent conversation insights: ${context.insights
        .slice(-3)
        .map((insight: any) => insight.content)
        .join(", ")}`
    }

    if (memories && memories.length > 0) {
      systemPrompt += `\n\nRelevant memories: ${memories.map((memory: any) => memory.content).join(", ")}`
    }

    const result = await streamText({
      model: groq("llama-3.1-70b-versatile"),
      messages,
      system: systemPrompt,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
