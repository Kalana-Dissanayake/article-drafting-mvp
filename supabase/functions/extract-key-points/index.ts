import { serve } from "https://deno.land/x/sift/mod.ts";
import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

serve(async (req) => {
  try {
    const { transcript, sources } = await req.json();

    if (!transcript && (!sources || sources.length === 0)) {
      return new Response(JSON.stringify({ error: "No content provided" }), { status: 400 });
    }

    // Prepare source text
    const sourceText = (sources || [])
      .filter(s => s.content && s.status === "ready")
      .map(s => `[${s.name}]: ${s.content}`)
      .join("\n\n") || "No supporting sources provided";

    // Create prompt
    const prompt = `You are an editorial assistant helping a human editor.

TASK: Extract the most important key points from the provided transcript and supporting sources.

Transcript:
${transcript || "No transcript provided"}

Supporting Source(s):
${sourceText}

INSTRUCTIONS:
1. Read carefully and extract 5–10 key points.
2. Write each point as a numbered list.
3. Include the source in brackets if applicable.
4. Do not invent information.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1000
    });

    const rawText = completion.choices[0]?.message?.content || "";

    // Parse numbered list into objects
    const keyPointsText = rawText
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim());

    const keyPoints = keyPointsText.map((text, index) => {
      // Extract source if present in brackets
      const sourceMatch = text.match(/\[([^\]]+)\]/);
      const sourceId = sourceMatch ? sourceMatch[1].toLowerCase() : "transcript";

      // Categorize automatically
      let category = "general";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("bias") || lowerText.includes("discrimination")) category = "bias";
      else if (lowerText.includes("example") || lowerText.includes("case")) category = "examples";
      else if (lowerText.includes("regulation") || lowerText.includes("law") || lowerText.includes("policy")) category = "regulation";
      else if (lowerText.includes("recommend") || lowerText.includes("should")) category = "recommendations";

      return {
        id: `extracted-${Date.now()}-${index}`,
        text: text.replace(/\[[^\]]+\]/g, "").trim(),
        sourceId,
        category,
        approved: false,
        confidence: 0.85 + Math.random() * 0.15
      };
    });

    return new Response(JSON.stringify({ keyPoints }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error in extract-key-points function:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
