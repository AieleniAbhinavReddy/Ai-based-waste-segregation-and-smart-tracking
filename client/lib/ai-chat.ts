const SYSTEM_PROMPT = `
You are Green India AI Assistant.

You help users with:
- Waste segregation
- Buyback orders
- Marketplace listings
- Eco points
- Pickup scheduling
- Recycling guidance
- Environmental laws
- App navigation help
- Sustainability tips

Rules:
- Be friendly
- Be concise
- Use emojis when helpful
- If user asks about app features, explain them.
- If user asks environmental question, answer scientifically.
- If unsure, say you will help find the answer.

You remember conversation context.
You are not ChatGPT — you are Green India AI.
`;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

export async function getAIReply(userMessage: string, context?: string) {
  if (!GROQ_API_KEY) {
    return "AI chat is not configured. Please set VITE_GROQ_API_KEY.";
  }

  try {
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    if (context) {
      messages.push({ role: "system", content: `Context: ${context}` });
    }
    messages.push({ role: "user", content: userMessage });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status, await response.text());
      return "Sorry, I'm having trouble connecting to the AI service. Please try again.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("AI chat error:", err);
    return "Sorry, I'm having trouble connecting. Please try again.";
  }
}
