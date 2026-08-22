// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code is designed to run in Supabase Edge Functions (Deno environment).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AIRequestPayload {
  action:
    | "generate-trip"
    | "trip-copilot"
    | "optimize-trip"
    | "budget-explanation"
    | "recommendation-explanation";
  payload: Record<string, unknown>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured on the server.",
          isConfigured: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const modelName = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
    const body: AIRequestPayload = await req.json();
    const { action, payload } = body;

    let systemInstruction = "";
    let userPrompt = "";
    let isJsonExpected = true;

    switch (action) {
      case "generate-trip": {
        systemInstruction = `You are GlobeTrotter AI's Expert Travel Planner.
Your job is to generate a comprehensive, realistic, and delightful multi-city travel itinerary based on the user's constraints.
CRITICAL RULES:
1. Return ONLY valid JSON conforming to the exact schema provided.
2. DO NOT invent database UUIDs. Use clear city names and activity titles.
3. Respect the user's budget and duration strictly.
4. Distribute days across cities logically (e.g. 2-4 days per city).
5. For each day, schedule 2-4 realistic activities with suggested morning/afternoon/evening times (e.g. "09:30", "14:00", "19:00").
6. Provide estimated costs in INR (Indian Rupee) for each activity realistically.`;

        userPrompt = `User Request: "${payload.prompt}"
User Constraints:
- Target Budget: ₹${payload.targetBudget || "Flexible"}
- Duration: ${payload.durationDays || "Flexible"} Days
- Travel Style: ${payload.travelStyle || "Moderate"}
- Interests: ${(payload.interests as string[] || []).join(", ") || "General Sightseeing, Culture, Food"}
${payload.catalogSummary ? `Available Verified Destinations in Catalog:\n${payload.catalogSummary}` : ""}

Return a JSON object in this exact format:
{
  "title": "Trip Title (e.g. Romantic Rajasthan Royal Heritage)",
  "summary": "2-3 sentence overview of this curated journey",
  "recommendedTravelStyle": "budget | moderate | luxury | backpacker",
  "estimatedTotalCost": 35000,
  "currency": "INR",
  "stops": [
    {
      "cityName": "City Name (e.g. Jaipur)",
      "country": "India",
      "stayDays": 3,
      "reasoning": "Why this city is perfect for the user's interests",
      "days": [
        {
          "dayNumber": 1,
          "theme": "Day Theme (e.g. Royal Palaces & Historic Bazaars)",
          "activities": [
            {
              "title": "Activity Title (e.g. Amber Fort Guided Tour)",
              "category": "Culture | Adventure | Food | Sightseeing | Relaxation",
              "scheduledTime": "09:30",
              "durationHours": 3.0,
              "estimatedCost": 500,
              "description": "Brief description of the experience and tips"
            }
          ]
        }
      ]
    }
  ]
}`;
        break;
      }

      case "trip-copilot": {
        isJsonExpected = false;
        systemInstruction = `You are GlobeTrotter AI's Personal Travel Copilot.
You are embedded directly inside the user's trip planning workspace.
RULES:
1. Answer the user's question with concise, actionable, and friendly advice.
2. Rely strictly on the provided trip context for factual trip details (cities, dates, activities, budget).
3. DO NOT hallucinate financial arithmetic; reference the verified deterministic budget figures supplied in the context.
4. Use bullet points for readability where helpful.`;

        userPrompt = `Current Trip Context:
${JSON.stringify(payload.tripContext, null, 2)}

User Question: "${payload.message}"
Previous Messages Context: ${JSON.stringify(payload.conversationHistory || [])}`;
        break;
      }

      case "optimize-trip": {
        systemInstruction = `You are GlobeTrotter AI's Itinerary Optimization Engine.
Analyze the user's current itinerary and budget constraints to suggest concrete, high-impact improvements.
CRITICAL RULES:
1. Return ONLY valid JSON.
2. Suggest realistic operations: "replace_activity", "remove_activity", "rebalance_day", or "reduce_pace".
3. For "replace_activity", identify the exact current activity title and suggest a viable alternative in the same city.
4. Estimate realistic cost savings or pace benefits.`;

        userPrompt = `User Goal: "${payload.goal || "Optimize for cost and better pacing"}"
Current Itinerary & Budget:
${JSON.stringify(payload.tripContext, null, 2)}

Return a JSON object in this format:
{
  "summary": "Brief explanation of the optimization strategy",
  "expectedTotalSavings": 3200,
  "paceImprovement": "Significantly reduced day congestion on Day 2",
  "suggestions": [
    {
      "id": "opt-1",
      "type": "replace_activity | remove_activity | rebalance_day",
      "title": "Short title of suggestion",
      "currentActivityTitle": "Name of activity to change",
      "replacementActivityTitle": "Suggested replacement activity or null",
      "cityName": "City Name",
      "dayNumber": 2,
      "reason": "Why this change benefits the traveler",
      "estimatedCostDifference": -2450
    }
  ]
}`;
        break;
      }

      case "budget-explanation": {
        isJsonExpected = false;
        systemInstruction = `You are GlobeTrotter AI's Financial Intelligence Advisor.
Your job is to translate raw deterministic budget numbers into friendly, reassuring, and actionable natural language explanations.
RULES:
1. Use ONLY the supplied budget numbers. DO NOT recalculate or contradict them.
2. Explain the deficit, highlight the top expense category, and explain how the suggested savings will help.
3. Keep the response to 2-3 engaging, polished paragraphs.`;

        userPrompt = `Deterministic Budget Analysis Data:
- Target Budget: ₹${payload.targetBudget}
- Current Total Cost: ₹${payload.currentCost}
- Deficit (Over budget): ₹${payload.deficit}
- Percentage Used: ${payload.percentageUsed}%
- Top Category: ${payload.mostExpensiveCategory?.category || "Activities"} (₹${payload.mostExpensiveCategory?.amount || 0})
- Peak Day: Day ${payload.mostExpensiveDay?.dayNumber || 1} (₹${payload.mostExpensiveDay?.amount || 0})
- Top Recommendation: ${payload.topSuggestion || "None"}
- Potential Savings: ₹${payload.totalPotentialSavings || 0}

Please provide a clear, encouraging, and actionable natural-language explanation of this budget state for the traveler.`;
        break;
      }

      case "recommendation-explanation": {
        isJsonExpected = false;
        systemInstruction = `You are GlobeTrotter AI's Destination Matchmaker.
Write a 1-2 sentence compelling reason why this destination scored highly for the user based on their specific preferences.`;

        userPrompt = `Destination: ${payload.cityName}, ${payload.country}
Match Score: ${payload.score}%
User Preferences:
- Budget: ₹${payload.targetBudget}
- Duration: ${payload.durationDays} Days
- Travel Style: ${payload.travelStyle}
- Interests: ${(payload.interests as string[] || []).join(", ")}
Scoring Factors:
- Budget Fit: ${payload.budgetFit}%
- Interest Overlap: ${payload.interestFit}%
- Popularity: ${payload.popularity}%`;
        break;
      }

      default:
        throw new Error(`Unsupported AI action: ${action}`);
    }

    // Call Gemini API via Google Generative Language REST Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: isJsonExpected ? 0.2 : 0.7,
        topP: 0.95,
        responseMimeType: isJsonExpected ? "application/json" : "text/plain",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({
          error: `Gemini API error (${response.status}): ${errorText}`,
          status: response.status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    const data = await response.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsedResult = rawText;
    if (isJsonExpected) {
      try {
        // Strip markdown code fences if model returned them
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        parsedResult = JSON.parse(cleaned);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", rawText, parseError);
        return new Response(
          JSON.stringify({
            error: "Failed to parse structured JSON from Gemini.",
            rawText,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 422,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        data: parsedResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: unknown) {
    console.error("Edge function error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
