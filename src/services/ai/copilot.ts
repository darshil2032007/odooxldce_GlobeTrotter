import { invokeGeminiAssistant } from "./client";
import { buildTripAIContext } from "./contextBuilder";
import type { TripWithDetails } from "@/types/database";

export interface CopilotChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * Invokes Gemini AI Travel Copilot with compact, verified trip and budget context.
 */
export async function sendCopilotMessage(
  trip: TripWithDetails,
  message: string,
  history: CopilotChatMessage[] = []
): Promise<string> {
  const tripContext = buildTripAIContext(trip);

  const formattedHistory = history.slice(-6).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const result = await invokeGeminiAssistant<string>({
    action: "trip-copilot",
    payload: {
      tripContext,
      message,
      conversationHistory: formattedHistory,
    },
  });

  return (
    result.data ||
    "I'm your GlobeTrotter Travel Copilot! How can I help optimize your itinerary or travel plans today?"
  );
}
