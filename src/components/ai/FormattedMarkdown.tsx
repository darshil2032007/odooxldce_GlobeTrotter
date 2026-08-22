import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Lightweight, zero-dependency, rich markdown parser & renderer for AI chat messages.
 * Formats headers, bullet lists, numbered lists, bold, italics, inline code, and dividers.
 */
export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = "",
  isUser = false,
}) => {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="space-y-1.5 my-2 pl-2 list-none"
        >
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    // Regex matching bold **text**, italic *text*, inline code `code`
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[2] !== undefined) {
        // Bold: **text** or __text__
        parts.push(
          <strong
            key={`bold-${match.index}`}
            className={isUser ? "font-bold text-white" : "font-bold text-surface-900 dark:text-surface-100"}
          >
            {match[2]}
          </strong>
        );
      } else if (match[4] !== undefined) {
        // Italic: *text* or _text_
        parts.push(
          <em key={`italic-${match.index}`} className="italic opacity-90">
            {match[4]}
          </em>
        );
      } else if (match[6] !== undefined) {
        // Code: `code`
        parts.push(
          <code
            key={`code-${match.index}`}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
              isUser
                ? "bg-white/20 text-white"
                : "bg-surface-100 dark:bg-surface-800 text-primary-600 dark:text-primary-400 border border-surface-200 dark:border-surface-700"
            }`}
          >
            {match[6]}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      elements.push(
        <hr
          key={`hr-${idx}`}
          className={`my-3 border-t ${
            isUser ? "border-white/20" : "border-surface-200 dark:border-surface-800"
          }`}
        />
      );
      return;
    }

    // Header 3: ### Title
    if (trimmed.startsWith("### ")) {
      flushList();
      const title = trimmed.replace(/^###\s+/, "");
      elements.push(
        <h4
          key={`h4-${idx}`}
          className={`font-extrabold text-xs sm:text-sm mt-3 mb-1.5 flex items-center gap-1.5 ${
            isUser ? "text-white" : "text-surface-900 dark:text-surface-100"
          }`}
        >
          {parseInline(title)}
        </h4>
      );
      return;
    }

    // Header 2: ## Title
    if (trimmed.startsWith("## ")) {
      flushList();
      const title = trimmed.replace(/^##\s+/, "");
      elements.push(
        <h3
          key={`h3-${idx}`}
          className={`font-black text-sm sm:text-base mt-3.5 mb-1.5 ${
            isUser ? "text-white" : "text-surface-900 dark:text-surface-100"
          }`}
        >
          {parseInline(title)}
        </h3>
      );
      return;
    }

    // Bullet List Item: * item or - item
    if (/^[\*\-]\s+/.test(trimmed)) {
      inList = true;
      const itemContent = trimmed.replace(/^[\*\-]\s+/, "");
      listItems.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-xs leading-relaxed">
          <span
            className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
              isUser ? "bg-white" : "bg-amber-500 dark:bg-amber-400"
            }`}
          />
          <div className="flex-1 min-w-0">{parseInline(itemContent)}</div>
        </li>
      );
      return;
    }

    // Numbered List Item: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      flushList();
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const itemContent = numMatch[2];
        elements.push(
          <div key={`num-${idx}`} className="flex items-start gap-2 text-xs leading-relaxed my-1.5 pl-1">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                isUser
                  ? "bg-white/20 text-white"
                  : "bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
              }`}
            >
              {num}
            </span>
            <div className="flex-1 min-w-0">{parseInline(itemContent)}</div>
          </div>
        );
        return;
      }
    }

    // Empty line / paragraph break
    if (!trimmed) {
      flushList();
      elements.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    // Normal paragraph text
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-xs leading-relaxed">
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
