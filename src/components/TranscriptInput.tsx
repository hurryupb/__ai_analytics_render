import React, { useRef, useState } from "react";
import { SAMPLE_TRANSCRIPTS } from "../data/samples";
import { SampleTranscript } from "../types";
import { 
  FileText, 
  Trash2, 
  Sparkles, 
  Upload, 
  AlertCircle, 
  FileUp,
  CheckCircle2
} from "lucide-react";

interface TranscriptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSample: (sample: SampleTranscript) => void;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({
  value,
  onChange,
  onSelectSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setSuccessMsg("");
  };

  const handleClear = () => {
    onChange("");
    setSuccessMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Process text files manually uploaded or dragged
  const processFile = (file: File) => {
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      alert("目前僅支援載入純文字檔案 (.txt 或 .md)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        onChange(text);
        setSuccessMsg(`已成功載入檔案：${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sample presets prompt card */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          快速載入實戰會議範本體驗
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_TRANSCRIPTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                setSuccessMsg(`已成功載入範本：「${sample.title}」`);
              }}
              className="p-3 text-left rounded-xl bg-white hover:bg-indigo-50/20 border border-slate-200 hover:border-indigo-400 transition-all duration-200 shadow-sm cursor-pointer group"
            >
              <div className="text-xs font-semibold text-indigo-600 mb-1 flex items-center justify-between">
                <span>{sample.category}</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                  {sample.duration}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 line-clamp-1">
                {sample.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-mono">
                {sample.transcript.substring(0, 50).trim()}...
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main text container with built-in drag/drop overlay & clear mechanism */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-indigo-600" />
            貼上會議逐字稿 / 討論摘要點記
          </label>
          <div className="flex items-center gap-3">
            {value.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-red-500 text-xs font-medium flex items-center gap-1.5 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
                title="清除所有文字"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清除
              </button>
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              上傳純文字檔 (.txt)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md"
              className="hidden"
            />
          </div>
        </div>

        {/* Input box wrap with conditional drap styling */}
        <div 
          className="relative rounded-2xl border transition-all duration-200"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <textarea
            value={value}
            onChange={handleTextChange}
            placeholder="請在此貼上會議逐字稿內容，或者是任何凌亂的筆記與發言記錄。您也可以點擊上方預設的實戰會議範本、或將 .txt 檔案直接拖曳至此處..."
            className={`w-full min-h-[380px] p-5 rounded-2xl text-slate-700 bg-white placeholder-slate-400 border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm leading-relaxed block resize-y transition-all ${
              dragActive 
                ? "border-indigo-600 bg-indigo-50/20 ring-4 ring-indigo-100" 
                : "border-slate-200"
            }`}
          />

          {dragActive && (
            <div className="absolute inset-0 bg-indigo-600/10 border-2 border-dashed border-indigo-600 rounded-2xl flex flex-col items-center justify-center text-indigo-700 pointer-events-none backdrop-blur-xs animate-pulse">
              <FileUp className="w-12 h-12 mb-2" />
              <span className="font-bold">放開滑鼠以載入純文字檔案</span>
              <span className="text-xs opacity-75 mt-1">支援 .txt 和 .md 檔案格式</span>
            </div>
          )}
        </div>

        {/* Success / Warning helper bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {successMsg ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-4.5 h-4.5" />
              {successMsg}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <AlertCircle className="w-3.5 h-3.5" />
              提示：逐字稿越完整，AI 識別出的與會者與行動方案精確度越高。
            </div>
          )}

          <div className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            字數統計：<span className="text-indigo-600 font-bold">{value.length.toLocaleString()}</span> 個字元
          </div>
        </div>
      </div>
    </div>
  );
};
