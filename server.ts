import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Use JSON body parser with increased limit for long transcripts
app.use(express.json({ limit: "15mb" }));

// System instructions for AI behavior
const SYSTEM_INSTRUCTION = `
你是一位專業的高級秘書兼多國語言翻譯專家。
你的任務是協助使用者將「會議逐字稿」或「重點筆記」整理成極度專業、結構清晰、美觀且易讀的會議摘要與記錄，並視使用者需求進行精準的翻譯。

請遵循以下規則來生成內容：
1. **主題與資訊**：如果能從逐字稿中推斷出會議主題、時間、與會者，請在最上方以簡潔明瞭的「會議基本資訊」格式化呈現（若無，則根據內容客觀擬定主題）。
2. **核心摘要**：用 2-3 句精煉的話，總結本次會議的主要目的與核心結論。
3. **討論重點與決議**：梳理會議的主要議題、各方討論觀點與重要決議。使用 Markdown 的列表、表格或粗體字來增強視覺層次，使其層次分明。
4. **行動方案 (Action Items)**：明確列出後續的待辦事項，格式為「[待辦事項] - 負責人 - 期限（若有）」。如果未明確提及負責人或期限，請標記為「未指定」或「全體」。
5. **用語習慣**：主要內容必須使用標準的「繁體中文」（台灣習慣語，例如「專案、軟體、資料、優化、程式、連結、介面」等）。
6. **翻譯規範**：
   - 如果使用者選擇「繁簡/中英等翻譯模式」，請根據指定的「翻譯模式」與「目標與會語言」進行翻譯。
   - 若為「對照模式」，請在繁體中文摘要下方提供對應語言的完整對照版本（結構相同）。
   - 若為「僅目標語言模式」，則整份摘要直接以目標語言輸出。

請以美觀、大方且排版流暢的 Markdown 格式回傳，不得包含任何多餘的解釋或提示詞。
`;

// API endpoint for processing meeting transcript with AI
app.post("/api/generate", async (req, res) => {
  try {
    const { transcript, style, translateOption, targetLanguage } = req.body;

    if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
      return res.status(400).json({ error: "會議紀錄內容不可為空。" });
    }

    if (!ai) {
      return res.status(500).json({
        error: "未偵測到 Gemini API 金鑰。請於 Settings > Secrets 設定 GEMINI_API_KEY 以啟用此功能。",
      });
    }

    // Build the user prompt based on options
    let promptInstruction = `以下是會議逐字稿/重點筆記：\n\n"""\n${transcript}\n"""\n\n`;
    promptInstruction += `請根據以下設定生成會議記錄：\n`;
    
    // Summary Style
    if (style === "concise") {
      promptInstruction += `- 摘要風格：極簡摘要，聚焦於最核心的決議與待辦事項。\n`;
    } else if (style === "detailed") {
      promptInstruction += `- 摘要風格：詳細記錄，完整列出各個討論細節、發言人觀點與所有細節。\n`;
    } else if (style === "action-oriented") {
      promptInstruction += `- 摘要風格：行動導向，特別著重並詳述行動方案、明確分配的任務與未來規劃。\n`;
    }

    // Translate Option & Language
    const langNames: Record<string, string> = {
      english: "英文 (English)",
      japanese: "日文 (日本語)",
      korean: "韓文 (한국어)",
      spanish: "西班牙文 (Español)",
    };

    const targetLangLabel = langNames[targetLanguage] || "英文 (English)";

    if (translateOption === "both") {
      promptInstruction += `- 翻譯設定：產出「繁體中文摘要」以及翻譯後的「${targetLangLabel} 對照版摘要」（格式請一致對齊）。\n`;
    } else if (translateOption === "target_only") {
      promptInstruction += `- 翻譯設定：不需產出中文版，直接將整份會議摘要翻譯並僅以「${targetLangLabel}」輸出。\n`;
    } else {
      promptInstruction += `- 翻譯設定：僅以「繁體中文」輸出會議摘要，不需翻譯。\n`;
    }

    // Call Gemini 3.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInstruction,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // 低隨機性以防胡言亂語，提高專業會議總結效果
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("模型回傳了空的內容。");
    }

    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "處理會議記錄時發生內部錯誤。" });
  }
});

async function startServer() {
  // Setup Vite Dev Middleware in local non-production environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    // Serve production static assets compiled inside dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
