export type SummaryStyle = "detailed" | "concise" | "action-oriented";

export type TranslateOption = "none" | "both" | "target_only";

export type TargetLanguage = "english" | "japanese" | "korean" | "spanish";

export interface GenerationSettings {
  style: SummaryStyle;
  translateOption: TranslateOption;
  targetLanguage: TargetLanguage;
}

export interface SampleTranscript {
  id: string;
  title: string;
  category: string;
  duration: string;
  transcript: string;
}
