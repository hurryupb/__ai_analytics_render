import React, { useState } from "react";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { TranscriptInput } from "./components/TranscriptInput";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { GenerationSettings, SampleTranscript } from "./types";
import { 
  Sparkles, 
  FileCheck, 
  Copy, 
  Check, 
  Download, 
  RefreshCcw, 
  AlertTriangle,
  FileText,
  HelpCircle,
  Lightbulb,
  Edit2,
  BookmarkCheck
} from "lucide-react";

export default function App() {
  // Main state setup
  const [transcript, setTranscript] = useState<string>("");
  const [settings, setSettings] = useState<GenerationSettings>({
    style: "detailed",
    translateOption: "none",
    targetLanguage: "english",
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // AI output text result
  const [generatedResult, setGeneratedResult] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Load sample template handler
  const handleSelectSample = (sample: SampleTranscript) => {
    setTranscript(sample.transcript);
    setApiError(null);
  };

  // Trigger Gemini API Summary & Translation process
  const handleTriggerGeneration = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setApiError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript,
          style: settings.style,
          translateOption: settings.translateOption,
          targetLanguage: settings.targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失敗，請確認伺服器或 API Key 設定。");
      }

      setGeneratedResult(data.result);
      setIsEditMode(false);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "發生末知的連線或是設定錯誤，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  // Action methods
  const handleCopyToClipboard = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyInput = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Failed to copy transcript", err);
    }
  };

  const handleDownloadResult = () => {
    if (!generatedResult) return;
    
    // Create text file attachment element and trigger client browser download
    const element = document.createElement("a");
    const file = new Blob([generatedResult], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    
    // Choose nice filename based on style
    const styleNames = {
      detailed: "詳細版",
      concise: "精簡版",
      "action-oriented": "任務行動版",
    };
    const styleLabel = styleNames[settings.style] || "摘要";
    const dateStr = new Date().toISOString().substring(0, 10);
    
    element.download = `AI會議記錄_${styleLabel}_${dateStr}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top visual helper box */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-10"></div>
          
          <div className="space-y-2 relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/20">
              企業級智能秘書
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              告別凌亂雜音，讓會議結果更有共識
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              貼上您的會議錄音逐字稿，AI 將自動辨識主題、關鍵對話、重要決議與後續指派工作，並可依排版直接輸出精美多國行銷、商務對照文件。
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3.5 relative z-10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-xs">
              <span className="text-teal-400 font-bold">●</span>
              <span>100% 繁中在地化</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-xs">
              <span className="text-indigo-400 font-bold">✓</span>
              <span>多領域任務導向</span>
            </div>
          </div>
        </div>

        {/* Master dual column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input + Config settings (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md shadow-slate-50/50 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  輸入與準備區塊
                </h2>
                {transcript.length > 0 && (
                  <button 
                    onClick={handleCopyInput}
                    className="text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1 hover:bg-slate-100 px-2.5 py-1 rounded transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? "已複製" : "複製原始稿"}
                  </button>
                )}
              </div>

              <TranscriptInput 
                value={transcript}
                onChange={setTranscript}
                onSelectSample={handleSelectSample}
              />
            </div>

            <SettingsPanel 
              settings={settings}
              onChange={setSettings}
            />

            {/* Glowing CTA Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                id="generate-button"
                disabled={isLoading || !transcript.trim()}
                onClick={handleTriggerGeneration}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
                  !transcript.trim()
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/60"
                    : isLoading
                      ? "bg-indigo-600/90 text-white cursor-wait relative overflow-hidden"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99] hover:shadow-indigo-200/80 hover:shadow-xl border-t border-indigo-400/25"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-wide animate-pulse">
                      智慧秘書正在彙整與翻譯中，請稍候...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
                    <span>生成會議記錄與翻譯</span>
                  </>
                )}
              </button>
              
              {!transcript.trim() && (
                <p className="text-center text-xs text-slate-400 mt-2.5">
                  請貼上逐字稿或點擊上方「範本」載入範例，方能啟動 AI 一鍵分析。
                </p>
              )}
            </div>
          </section>

          {/* Right Column: AI Output Display & Actions (lg:col-span-5) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-100/50 overflow-hidden flex flex-col min-h-[580px]">
              
              {/* Output block header */}
              <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">AI 智慧分析成果報告</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">預計生成格式：可拷貝 Markdown 文件</p>
                  </div>
                </div>

                {/* Toolbar actions for results */}
                {generatedResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isEditMode 
                          ? "bg-amber-500 text-white" 
                          : "bg-white/10 text-slate-200 hover:bg-white/20"
                      }`}
                      title={isEditMode ? "切換至預覽模式" : "切換至編輯模式"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {isEditMode ? "預覽" : "編修"}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadResult}
                      className="p-2 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="下載 Markdown 檔案"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下載
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyToClipboard}
                      className="p-2 rounded-lg bg-white text-slate-900 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="一鍵複製結果"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "已複製" : "複製"}
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Content Switching State */}
              <div className="flex-1 p-6 flex flex-col bg-white">
                {apiError ? (
                  <div className="m-auto max-w-sm text-center space-y-3.5 py-6">
                    <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">會議資料整合產生失敗</h4>
                      <p className="text-xs text-rose-600">{apiError}</p>
                    </div>
                    <button
                      onClick={handleTriggerGeneration}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all transition-all md:text-sm cursor-pointer"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      重新發送嘗試
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="m-auto max-w-sm text-center space-y-4 py-12">
                    <div className="relative w-16 h-16 mx-auto">
                      {/* Interactive pulsing radar spinner */}
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-sm">正在深度解析逐字稿...</h4>
                      <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                        Gemini 3.5 Flash 正在為您理順發言脈絡、建立客觀架構、並優化文法格式。這可能需要十到十五秒。
                      </p>
                    </div>

                    {/* Fun rolling dynamic indicators */}
                    <div className="bg-slate-50 border border-slate-100 py-2 px-4 rounded-xl text-[11px] text-slate-500 font-mono inline-flex gap-2 items-center">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                      正在建置待辦事項
                    </div>
                  </div>
                ) : generatedResult ? (
                  <div className="space-y-4 flex flex-col h-full flex-1">
                    
                    {/* Tiny info chips */}
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <BookmarkCheck className="w-4.5 h-4.5 text-indigo-600" />
                        <span>彙整樣式：</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {settings.style === "detailed" ? "完整詳細記錄" : settings.style === "concise" ? "精煉重點摘要" : "任務行動指引"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        生成字數：{generatedResult.length} 字
                      </div>
                    </div>

                    {/* Rendered View or Editor Box */}
                    {isEditMode ? (
                      <div className="flex-1 flex flex-col gap-2 min-h-[350px]">
                        <div className="p-2 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                          編輯模式：您可以自訂或修飾 AI 產出的草稿，完成後可點擊右上角「預覽」看新排版或直接「複製」、「下載」。
                        </div>
                        <textarea
                          value={generatedResult}
                          onChange={(e) => setGeneratedResult(e.target.value)}
                          className="flex-1 w-full min-h-[350px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-sm text-slate-800 font-mono resize-y leading-relaxed"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 max-h-[520px] overflow-y-auto">
                        <div className="prose prose-slate max-w-none text-slate-800 text-sm">
                          <MarkdownRenderer content={generatedResult} />
                        </div>
                      </div>
                    )}

                    {/* Extra export guidance hints */}
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0" />
                        秘書小提醒
                      </p>
                      <p className="leading-relaxed opacity-90">
                        產出的 Markdown 能夠直接貼上至 Notion、Jira、Github 或是 HackMD 發佈。直接「複製」即可攜帶排版貼上上述軟體。
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="m-auto text-center space-y-4 py-12 max-w-xs">
                    <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mx-auto border border-slate-200/50">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-700 text-sm">尚未有生成的紀錄</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        請在左側貼上会议原始內容、然後選擇所需的處理風格與翻譯。按下「生成會議記錄與翻譯」按鈕後，這裡將立即呈現完美的結構化會議報告。
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action list feedback footer inside card */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  支援 Markdown 標準
                </span>
                <span className="font-semibold text-slate-400">繁體中文商業格式</span>
              </div>

            </div>

            {/* Quick Tips and Help Widget Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
                常見操作與 API 串接指南
              </h4>
              <ul className="space-y-2.5 list-none">
                <li className="flex gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">Q.</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-800 block">如何更改或設定 API Key 金鑰？</strong>
                    在 Google AI Studio 介面中，您可以透過右手邊或是設定按鈕底下的 <strong>Secrets 面板</strong> 建立並輸入 <code>GEMINI_API_KEY</code>，系統便會即時載入，無需重新發佈容器。
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">Q.</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-800 block">生成的會議記錄字數太多是否會截斷？</strong>
                    我們已經採用了 <code>gemini-3.5-flash</code> 高效模型並設置了 <code>15MB</code> 資料傳輸上限。後端能完美消化與分析高達數萬言的長篇逐字稿，不用擔心文章過長。
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Aesthetic human attribution minimal footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center mt-12 text-xs text-slate-400 font-medium">
        <p>© 2026 AI 會議記錄生成與翻譯工具 · Google AI Studio 團隊設計與研發</p>
      </footer>
    </div>
  );
}
