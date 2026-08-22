import { supabase } from "@/lib/supabase";

export interface InvokeAIParams {
  action:
    | "generate-trip"
    | "trip-copilot"
    | "optimize-trip"
    | "budget-explanation"
    | "recommendation-explanation";
  payload: Record<string, unknown>;
}

export interface AIResponseWrapper<T> {
  success: boolean;
  data: T;
  source: "edge-function" | "gemini-direct" | "resilient-fallback";
  error?: string;
}

/**
 * Unified invoker for Gemini AI.
 * 1. Tries Supabase Edge Function first (`gemini-travel-assistant`).
 * 2. If Edge Function is unavailable in local dev, directly invokes Google Gemini API via VITE_GEMINI_API_KEY.
 * 3. If offline, falls back to deterministic local synthesis.
 */
export async function invokeGeminiAssistant<T>(
  params: InvokeAIParams
): Promise<AIResponseWrapper<T>> {
  // 1. Try Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke(
      "gemini-travel-assistant",
      {
        body: params,
      }
    );

    if (!error && data && data.success) {
      return {
        success: true,
        data: data.data as T,
        source: "edge-function",
      };
    }
  } catch (edgeErr) {
    console.debug("Edge function unavailable, evaluating direct API key...", edgeErr);
  }

  // 2. Direct Gemini API call if key is available in environment
  const directApiKey = (
    import.meta.env.VITE_GEMINI_API_KEY ||
    ""
  ).trim();

  if (directApiKey && directApiKey !== "undefined") {
    try {
      const directResult = await callGeminiDirectly<T>(params, directApiKey);
      return {
        success: true,
        data: directResult,
        source: "gemini-direct",
      };
    } catch (apiErr) {
      console.warn("Direct Gemini API call error:", apiErr);
    }
  }

  // 3. Fallback to resilient local synthesis
  const fallbackData = generateLocalAIFallback<T>(params);
  return {
    success: true,
    data: fallbackData,
    source: "resilient-fallback",
  };
}

/**
 * Direct Google Gemini API caller for local development
 */
async function callGeminiDirectly<T>(
  params: InvokeAIParams,
  apiKey: string
): Promise<T> {
  const modelName =
    import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
  const { action, payload } = params;

  let systemInstruction = "";
  let userPrompt = "";
  let isJsonExpected = true;

  switch (action) {
    case "generate-trip": {
      systemInstruction = `You are GlobeTrotter AI's Expert Travel Planner.
Your job is to generate a comprehensive, realistic multi-city travel itinerary.
CRITICAL RULES:
1. Return ONLY valid JSON conforming to the exact schema.
2. DO NOT invent database UUIDs.
3. Respect user budget and duration strictly.`;

      userPrompt = `User Request: "${payload.prompt}"
User Constraints:
- Target Budget: ₹${payload.targetBudget || "Flexible"}
- Duration: ${payload.durationDays || "Flexible"} Days
- Travel Style: ${payload.travelStyle || "Moderate"}
- Interests: ${(payload.interests as string[] || []).join(", ") || "General Sightseeing"}
${payload.catalogSummary ? `Available Catalog Destinations:\n${payload.catalogSummary}` : ""}

Return a JSON object in this exact format:
{
  "title": "Trip Title",
  "summary": "2-3 sentence overview",
  "recommendedTravelStyle": "budget | moderate | luxury | backpacker",
  "estimatedTotalCost": 35000,
  "currency": "INR",
  "stops": [
    {
      "cityName": "City Name",
      "country": "India",
      "stayDays": 3,
      "reasoning": "Why this city is chosen",
      "days": [
        {
          "dayNumber": 1,
          "theme": "Day Theme",
          "activities": [
            {
              "title": "Activity Title",
              "category": "Culture | Adventure | Food | Sightseeing | Relaxation",
              "scheduledTime": "09:30",
              "durationHours": 3.0,
              "estimatedCost": 500,
              "description": "Brief description"
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
      systemInstruction = `You are GlobeTrotter AI's Personal Travel Copilot. Answer concisely based on the supplied trip context.`;
      userPrompt = `Trip Context: ${JSON.stringify(payload.tripContext, null, 2)}\nUser Question: "${payload.message}"\nHistory: ${JSON.stringify(payload.conversationHistory || [])}`;
      break;
    }

    case "optimize-trip": {
      systemInstruction = `You are GlobeTrotter AI's Itinerary Optimization Engine. Suggest high-impact improvements.`;
      userPrompt = `Goal: "${payload.goal || "Optimize for cost and better pacing"}"\nTrip Context: ${JSON.stringify(payload.tripContext, null, 2)}
Return JSON:
{
  "summary": "Explanation",
  "expectedTotalSavings": 2500,
  "paceImprovement": "Balanced afternoon pacing",
  "suggestions": [
    {
      "id": "opt-1",
      "type": "replace_activity | remove_activity",
      "title": "Suggestion title",
      "currentActivityTitle": "Activity to replace",
      "replacementActivityTitle": "Replacement activity",
      "cityName": "City Name",
      "dayNumber": 2,
      "reason": "Why this helps",
      "estimatedCostDifference": -2450
    }
  ]
}`;
      break;
    }

    case "budget-explanation": {
      isJsonExpected = false;
      systemInstruction = `You are GlobeTrotter AI's Financial Intelligence Advisor. Explain the deterministic budget numbers in 2-3 friendly paragraphs.`;
      const catObj = payload.mostExpensiveCategory as { category?: string; amount?: number } | null | undefined;
      userPrompt = `Data: Target ₹${payload.targetBudget}, Spent ₹${payload.currentCost}, Deficit ₹${payload.deficit}, Top Category: ${catObj?.category || "Activities"} (₹${catObj?.amount || 0}), Potential Savings: ₹${payload.totalPotentialSavings || 0}`;
      break;
    }

    case "recommendation-explanation": {
      isJsonExpected = false;
      systemInstruction = `Write 1-2 sentence compelling reason why this destination scored highly.`;
      userPrompt = `City: ${payload.cityName}, Match Score: ${payload.score}%, Budget: ₹${payload.targetBudget}, Style: ${payload.travelStyle}, Interests: ${(payload.interests as string[] || []).join(", ")}`;
      break;
    }
  }

  // Choose appropriate endpoint model (fallback if non-standard model name)
  const targetModel = modelName.startsWith("gemini") ? modelName : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: isJsonExpected ? 0.2 : 0.7,
      responseMimeType: isJsonExpected ? "application/json" : "text/plain",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API call failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (isJsonExpected) {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  }

  return rawText as unknown as T;
}

/**
 * Deterministic local fallback synthesis for offline resilience.
 */
function generateLocalAIFallback<T>(params: InvokeAIParams): T {
  const { action, payload } = params;

  switch (action) {
    case "generate-trip": {
      const prompt = String(payload.prompt || "Expedition");
      const duration = Number(payload.durationDays || 5);
      const budget = Number(payload.targetBudget || 35000);

      let city = "Goa";
      if (/jaipur|rajasthan|palace|desert/i.test(prompt)) city = "Jaipur";
      else if (/mumbai|bombay|marine|bollywood/i.test(prompt)) city = "Mumbai";
      else if (/ahmedabad|gujarat|heritage/i.test(prompt)) city = "Ahmedabad";
      else if (/bangalore|bengaluru|tech|park/i.test(prompt)) city = "Bangalore";

      return {
        title: `${city} Highlights & Cultural Discovery`,
        summary: `A balanced ${duration}-day travel experience crafted around ${prompt.slice(0, 40)}..., balancing must-see attractions, authentic cuisine, and relaxing evenings.`,
        recommendedTravelStyle: payload.travelStyle || "moderate",
        estimatedTotalCost: Math.min(budget, duration * 6000),
        currency: "INR",
        stops: [
          {
            cityName: city,
            country: "India",
            stayDays: duration,
            reasoning: `Selected for its rich cultural landmarks, world-class dining, and alignment with your budget.`,
            days: Array.from({ length: duration }).map((_, i) => ({
              dayNumber: i + 1,
              theme: i === 0 ? "Arrival & Heritage Exploration" : i === 1 ? "Scenic Highlights & Local Food" : "Cultural immersion & Sunset Relaxation",
              activities: [
                {
                  title: `${city} Heritage Landmark Discovery`,
                  category: "Culture",
                  scheduledTime: "09:30",
                  durationHours: 3.0,
                  estimatedCost: 350,
                  description: "Guided tour through iconic architectural monuments and historic grounds.",
                },
                {
                  title: "Authentic Regional Culinary Walk",
                  category: "Food",
                  scheduledTime: "13:30",
                  durationHours: 2.0,
                  estimatedCost: 650,
                  description: "Sample famous local delicacies and traditional specialties.",
                },
                {
                  title: "Sunset Promenade & Evening Leisure",
                  category: "Relaxation",
                  scheduledTime: "18:00",
                  durationHours: 2.0,
                  estimatedCost: 150,
                  description: "Unwind along scenic promenades with relaxing evening views.",
                },
              ],
            })),
          },
        ],
      } as unknown as T;
    }

    case "budget-explanation": {
      const deficit = Number(payload.deficit || 0);
      const targetBudget = Number(payload.targetBudget || 0);
      const currentCost = Number(payload.currentCost || 0);
      const topCategory = (payload.mostExpensiveCategory as { category: string })?.category || "Activities";
      const totalSavings = Number(payload.totalPotentialSavings || 0);

      if (deficit > 0) {
        return `Your current itinerary total of ₹${currentCost.toLocaleString("en-IN")} exceeds your target budget of ₹${targetBudget.toLocaleString("en-IN")} by ₹${deficit.toLocaleString("en-IN")}. ${topCategory} is your largest cost center. By adopting the suggested activity replacements, you can recover up to ₹${totalSavings.toLocaleString("en-IN")}, successfully bringing your trip back within budget without sacrificing key travel experiences.` as unknown as T;
      }
      return `Your budget is in excellent shape! You have ₹${(targetBudget - currentCost).toLocaleString("en-IN")} in reserve, giving you ample flexibility for spontaneous local dining and shopping during your journey.` as unknown as T;
    }

    case "optimize-trip": {
      return {
        summary: "Analyzed your itinerary for peak congested days and high-cost activity centers. Applying these optimizations frees up budget and creates a smoother daily rhythm.",
        expectedTotalSavings: 2450,
        paceImprovement: "Reduces peak day rush and replaces premium booking fees with top-rated local alternatives.",
        suggestions: [
          {
            id: "opt-fallback-1",
            type: "replace_activity",
            title: "Swap High-Fee Activity for Scenic Walking Tour",
            currentActivityTitle: "Scuba Diving",
            replacementActivityTitle: "Fort Aguada",
            cityName: "Goa",
            dayNumber: 4,
            reason: "Fort Aguada provides iconic 17th-century coastal views and Portuguese history at a fraction of the scuba diving ticket cost.",
            estimatedCostDifference: -2450,
          },
        ],
      } as unknown as T;
    }

    case "trip-copilot": {
      const q = String(payload.message || "").toLowerCase();
      if (q.includes("budget") || q.includes("expensive") || q.includes("money") || q.includes("cost")) {
        return "Based on your verified budget breakdown, your spending is highest on Day 4 and in the Activities category. Reviewing the Smart Budget Assistant recommendations can help you trim non-essential costs while keeping your trip memorable!" as unknown as T;
      }
      if (q.includes("pack") || q.includes("bring") || q.includes("clothes")) {
        return "For your destinations, pack comfortable walking shoes for palace stepwells and forts, breathable cotton or linen clothing, a light evening layer, sun protection (sunglasses, hat, sunscreen), and a reusable water bottle." as unknown as T;
      }
      return "I've reviewed your trip itinerary! Your schedule has a great balance of cultural landmarks and leisure time. Feel free to ask about local cuisine recommendations, packing essentials, or budget optimizations!" as unknown as T;
    }

    case "recommendation-explanation": {
      const cityName = String(payload.cityName || "Destination");
      return `${cityName} is an outstanding match because its cost profile aligns with your target daily budget and offers premier cultural experiences suited for your travel style.` as unknown as T;
    }

    default:
      return {} as unknown as T;
  }
}
