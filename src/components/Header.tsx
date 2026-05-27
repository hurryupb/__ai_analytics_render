import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, Clock, Globe } from "lucide-react";

export const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Traditional Chinese locale formatting
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setCurrentTime(now.toLocaleString("zh-TW", options));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-slate-100 py-5 px-6 sm:px-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AI 會議記錄生成與翻譯工具
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 內建
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            快速提取逐字稿核心、條列決議與行動方案，支援多國專用商務翻譯
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50/80 px-4 py-2 rounded-lg border border-slate-100 self-start md:self-center">
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3.5">
          <Calendar className="w-4.5 h-4.5 text-slate-400" />
          <span className="font-mono text-slate-600">系統即時</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4.5 h-4.5 text-indigo-500 animate-spin-slow" />
          <span className="font-mono text-indigo-600 font-semibold">{currentTime || "載入中..."}</span>
        </div>
      </div>
    </header>
  );
};
