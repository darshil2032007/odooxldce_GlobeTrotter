import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sendCopilotMessage, type CopilotChatMessage } from "@/services/ai/copilot";
import { FormattedMarkdown } from "./FormattedMarkdown";
import type { TripWithDetails } from "@/types/database";

interface AITravelCopilotDrawerProps {
  trip: TripWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_PROMPTS = [
  "Why is my trip over budget?",
  "Which day is the most congested?",
  "What are packing essentials for this route?",
  "Suggest authentic local food spots",
];

export function AITravelCopilotDrawer({
  trip,
  open,
  onOpenChange,
}: AITravelCopilotDrawerProps) {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello! I'm your Gemini Travel Copilot for **${trip.title}**. I have full context of your destinations, schedule, and deterministic budget breakdown. What would you like to explore or optimize today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: CopilotChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const replyText = await sendCopilotMessage(trip, text, messages);

      const botMsg: CopilotChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: CopilotChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I had trouble reaching the AI assistant. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col justify-between border-l border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950"
      >
        {/* Header */}
        <SheetHeader className="p-4 bg-surface-900 text-white flex flex-row items-center justify-between border-b border-surface-800 space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-400/20 p-2 text-amber-300 ring-1 ring-amber-400/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
                Travel Copilot
                <Badge
                  variant="outline"
                  className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] py-0 px-1.5"
                >
                  Gemini 3.5 Flash Lite
                </Badge>
              </SheetTitle>
              <p className="text-[11px] text-surface-400 truncate max-w-[220px]">
                {trip.title}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-surface-900 dark:bg-surface-800 text-amber-400 flex items-center justify-center shrink-0 text-xs shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 border border-surface-200/80 dark:border-surface-800 rounded-bl-none"
                  }`}
                >
                  <FormattedMarkdown content={msg.content} isUser={isUser} />
                  <span
                    className={`block text-[10px] pt-1.5 text-right ${
                      isUser ? "text-white/70" : "text-surface-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-surface-400 italic pl-9">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-500" />
              <span>Copilot is analyzing your itinerary...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-surface-100/70 dark:bg-surface-900/50 border-t border-surface-200/60 dark:border-surface-800 space-y-1.5">
          <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider block">
            Suggested Prompts
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] rounded-full border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-2.5 py-1 text-surface-600 dark:text-surface-300 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your itinerary..."
              className="text-xs bg-surface-50 dark:bg-surface-900"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
