import React from "react";
import { GenerationSettings, SummaryStyle, TranslateOption, TargetLanguage } from "../types";
import { 
  FileText, 
  Sparkles, 
  Languages, 
  Check, 
  Zap, 
  AlignLeft, 
  ListTodo, 
  Compass 
} from "lucide-react";

interface SettingsPanelProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const styleOptions: Array<{
    value: SummaryStyle;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }> = [
    {
      value: "detailed",
      label: "完整詳細記錄",
      description: "保留各議題深度討論細節、發言人多元觀點與全盤討論脈絡。",
      icon: <AlignLeft className="w-5 h-5" />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      value: "concise",
      label: "精煉重點摘要",
      description: "直奔會議最核心的決議與最關鍵的痛點，剔除口水話，力求簡潔。",
      icon: <Zap className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      value: "action-oriented",
      label: "關鍵任務指引",
      description: "極致凸顯待辦清單、行動指標、責任擔當、截止時鐘與未來追蹤。",
      icon: <ListTodo className="w-5 h-5" />,
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
  ];

  const translateOptions: Array<{
    value: TranslateOption;
    label: string;
    description: string;
  }> = [
    {
      value: "none",
      label: "僅使用繁體中文輸出",
      description: "完全不需翻譯，提供專職的純台灣式繁體商務會議記錄。",
    },
    {
      value: "both",
      label: "生成中外雙語對照版",
      description: "第一部分顯示標準繁體中文，第二部分顯示高精度對照翻譯。",
    },
    {
      value: "target_only",
      label: "僅輸出翻譯目標語言",
      description: "略過繁中原稿整理，直接對齊並僅以外交級外語召開與輸出。",
    },
  ];

  const languages: Array<{
    value: TargetLanguage;
    label: string;
    nativeLabel: string;
    flag: string;
  }> = [
    { value: "english", label: "商務英語", nativeLabel: "English", flag: "🇺🇸" },
    { value: "japanese", label: "商用日語", nativeLabel: "日本語", flag: "🇯🇵" },
    { value: "korean", label: "核心韓語", nativeLabel: "한국어", flag: "🇰🇷" },
    { value: "spanish", label: "國際西班牙語", nativeLabel: "Español", flag: "🇪🇸" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md shadow-slate-50/50 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Compass className="w-5 h-5 text-indigo-600" />
        <h2 className="font-bold text-slate-800 text-base">AI 會議處理引擎設定</h2>
      </div>

      {/* 1. Summary Style Sector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          第一步：選擇摘要彙總風格
        </label>
        <div className="grid grid-cols-1 gap-3">
          {styleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSetting("style", opt.value)}
              className={`flex items-start gap-3.5 p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                settings.style === opt.value
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-100"
                  : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div className={`p-2 rounded-lg ${opt.bg} ${opt.color} shrink-0`}>
                {opt.icon}
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-800 text-sm flex items-center justify-between">
                  {opt.label}
                  {settings.style === opt.value && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  {opt.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Translation Sector */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-slate-400" />
          第二步：多國翻譯模式
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {translateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSetting("translateOption", opt.value)}
              className={`p-3 rounded-lg text-left border text-xs transition-all duration-150 cursor-pointer ${
                settings.translateOption === opt.value
                  ? "border-indigo-600 bg-indigo-50/20 font-medium"
                  : "border-slate-100 bg-white hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{opt.label}</span>
                {settings.translateOption === opt.value && (
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Target Language Sector (Shows only if translation is requested) */}
      {settings.translateOption !== "none" && (
        <div className="space-y-3 pt-2 animate-fadeIn">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            第三步：指定翻譯目標語系
          </label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => updateSetting("targetLanguage", lang.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  settings.targetLanguage === lang.value
                    ? "border-indigo-600 bg-indigo-50/40 font-medium"
                    : "border-slate-100 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="text-xl shrink-0">{lang.flag}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-xs truncate">
                    {lang.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {lang.nativeLabel}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
