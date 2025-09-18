import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, sources } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare content for extraction
    const transcriptText = transcript || "No transcript provided";
    const sourceText = sources
      ?.filter((s: any) => s.content && s.status === "ready")
      ?.map((s: any) => `[${s.name}]: ${s.content}`)
      ?.join("\n\n") || "No supporting sources provided";

    // Create the extraction prompt
    const prompt = `You are an editorial assistant helping a human editor.

TASK: Extract the most important key points from the provided interview transcript and supporting sources.

Transcript:
${transcriptText}

Supporting Source(s):
${sourceText}

INSTRUCTIONS:
1. Read the transcript and supporting sources carefully.
2. Identify 5–10 key points that are factual, distinct, and relevant to the story.
3. Write each key point as a clear, short sentence.
4. If a point is supported by a source, note the source in brackets. Example: [Transcript], [Source PDF], [Web article].
5. Do not invent new information. Only use what is present in the transcript and sources.
6. Output the key points as a numbered list.`;

    console.log('Making request to OpenAI API');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    console.log('Received response from OpenAI:', content);
    
    // Parse the numbered list response
    const keyPointsText = content.split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());

    // Convert to key point objects
    const keyPoints = keyPointsText.map((text: string, index: number) => {
      // Extract source references
      const sourceMatch = text.match(/\[([^\]]+)\]/);
      const sourceId = sourceMatch ? sourceMatch[1].toLowerCase() : "transcript";
      
      // Categorize based on content
      let category = "general";
      if (text.toLowerCase().includes("bias") || text.toLowerCase().includes("discrimination")) {
        category = "bias";
      } else if (text.toLowerCase().includes("example") || text.toLowerCase().includes("case")) {
        category = "examples";
      } else if (text.toLowerCase().includes("regulation") || text.toLowerCase().includes("law") || text.toLowerCase().includes("policy")) {
        category = "regulation";
      } else if (text.toLowerCase().includes("recommend") || text.toLowerCase().includes("should")) {
        category = "recommendations";
      }

      return {
        id: `extracted-${Date.now()}-${index}`,
        text: text.replace(/\[[^\]]+\]/g, '').trim(), // Remove source brackets from text
        sourceId,
        category,
        approved: false,
        confidence: 0.85 + (Math.random() * 0.15) // Random confidence between 0.85-1.0
      };
    });

    console.log(`Successfully extracted ${keyPoints.length} key points`);

    return new Response(JSON.stringify({ keyPoints }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-key-points function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});