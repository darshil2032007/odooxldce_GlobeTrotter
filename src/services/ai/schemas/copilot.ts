import { z } from "zod";

export const AICopilotMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
  suggestedQuickReplies: z.array(z.string()).optional(),
});

export type AICopilotMessage = z.infer<typeof AICopilotMessageSchema>;
