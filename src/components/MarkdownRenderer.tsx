import React, { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const lines = content.split("\n");
    let isInsideList = false;
    let currentListType: "ul" | "ol" | null = null;
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;

    // Helper to format line-level elements like bold and inline code
    const parseFormatting = (text: string): React.ReactNode[] => {
      // Find bold blocks **text** and inline code `code`
      const boldRegex = /\*\*(.*?)\*\*/g;
      const codeRegex = /`(.*?)`/g;

      // Temporary structure to hold text segments
      let parts: Array<{ type: "text" | "bold" | "code"; content: string }> = [
        { type: "text", content: text },
      ];

      // Match Bold
      let boldMatch;
      let hasBold = false;
      const boldParts: typeof parts = [];

      for (const part of parts) {
        if (part.type !== "text") {
          boldParts.push(part);
          continue;
        }

        let lastIndex = 0;
        const subText = part.content;
        boldRegex.lastIndex = 0;

        while ((boldMatch = boldRegex.exec(subText)) !== null) {
          hasBold = true;
          const before = subText.substring(lastIndex, boldMatch.index);
          const boldText = boldMatch[1];

          if (before) {
            boldParts.push({ type: "text", content: before });
          }
          boldParts.push({ type: "bold", content: boldText });
          lastIndex = boldRegex.lastIndex;
        }

        const after = subText.substring(lastIndex);
        if (after || !hasBold) {
          boldParts.push({ type: "text", content: after || subText });
        }
      }

      parts = boldParts;

      // Match Code
      const codeParts: typeof parts = [];
      let codeMatch;

      for (const part of parts) {
        if (part.type !== "text") {
          codeParts.push(part);
          continue;
        }

        let lastIndex = 0;
        const subText = part.content;
        codeRegex.lastIndex = 0;
        let hasCode = false;

        while ((codeMatch = codeRegex.exec(subText)) !== null) {
          hasCode = true;
          const before = subText.substring(lastIndex, codeMatch.index);
          const codeText = codeMatch[1];

          if (before) {
            codeParts.push({ type: "text", content: before });
          }
          codeParts.push({ type: "code", content: codeText });
          lastIndex = codeRegex.lastIndex;
        }

        const after = subText.substring(lastIndex);
        if (after || !hasCode) {
          codeParts.push({ type: "text", content: after || subText });
        }
      }

      return codeParts.map((p, idx) => {
        if (p.type === "bold") {
          return (
            <strong key={idx} className="font-semibold text-slate-900 border-b border-rose-100 bg-rose-50/20 px-0.5 rounded">
              {p.content}
            </strong>
          );
        }
        if (p.type === "code") {
          return (
            <code key={idx} className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200">
              {p.content}
            </code>
          );
        }
        return p.content;
      });
    };

    let listItemsBuffer: React.ReactNode[] = [];

    const flushList = () => {
      if (listItemsBuffer.length > 0) {
        const listKey = `list-${keyCounter++}`;
        elements.push(
          <ul key={listKey} className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
            {listItemsBuffer}
          </ul>
        );
        listItemsBuffer = [];
        isInsideList = false;
        currentListType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty Line
      if (line === "") {
        flushList();
        elements.push(<div key={`empty-${keyCounter++}`} className="h-2" />);
        continue;
      }

      // Headers
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={`h1-${keyCounter++}`} className="text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full inline-block"></span>
            {parseFormatting(line.substring(2))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={`h2-${keyCounter++}`} className="text-xl font-bold text-slate-800 mt-5 mb-2.5 flex items-center gap-2">
            <span className="w-1 h-5 bg-teal-500 rounded-full inline-block"></span>
            {parseFormatting(line.substring(3))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${keyCounter++}`} className="text-lg font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-indigo-500 rounded-full inline-block"></span>
            {parseFormatting(line.substring(4))}
          </h3>
        );
      }
      // Horizontal Rule
      else if (line === "---" || line === "***") {
        flushList();
        elements.push(<hr key={`hr-${keyCounter++}`} className="my-6 border-slate-200" />);
      }
      // List Items (Bullet Points)
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        isInsideList = true;
        currentListType = "ul";
        const contentStr = line.substring(2);
        
        // Highlight action items specially if they contain [待辦事項] or similar
        const isActionItem = contentStr.includes("[待辦事項]") || contentStr.includes("[Action Item]");
        
        listItemsBuffer.push(
          <li 
            key={`li-${keyCounter++}`} 
            className={`pl-1 leading-relaxed ${isActionItem ? "bg-amber-50/60 p-1.5 rounded-r border-l-2 border-amber-500 my-1 list-none" : ""}`}
          >
            {isActionItem && <span className="inline-flex mr-1.5 px-1.5 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded">待辦</span>}
            {parseFormatting(contentStr)}
          </li>
        );
      }
      // Numbered List Items
      else if (/^\d+\.\s/.test(line)) {
        flushList(); // Simplified list management
        const contentStr = line.replace(/^\d+\.\s/, "");
        elements.push(
          <div key={`ol-${keyCounter++}`} className="flex gap-2.5 pl-2 mb-2">
            <span className="font-bold text-indigo-600 font-mono min-w-[20px] text-right">
              {line.match(/^\d+/)![0]}.
            </span>
            <div className="flex-1 text-slate-700 leading-relaxed">
              {parseFormatting(contentStr)}
            </div>
          </div>
        );
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={`bq-${keyCounter++}`} className="border-l-4 border-slate-300 bg-slate-50 px-4 py-2.5 my-3 rounded-r text-slate-600 italic">
            {parseFormatting(line.substring(2))}
          </blockquote>
        );
      }
      // Standard Paragraph
      else {
        flushList();
        elements.push(
          <p key={`p-${keyCounter++}`} className="text-slate-700 leading-relaxed mb-3 text-base">
            {parseFormatting(line)}
          </p>
        );
      }
    }

    // Flush any leftover lists at the end
    flushList();

    return elements;
  }, [content]);

  return <div className="space-y-1">{renderedElements}</div>;
};
