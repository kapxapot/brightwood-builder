import type { GraphNodeType } from "../entities/story-node";
import { LanguageInfo } from "./types";

type ColorInfo = {
  tw: string;
  twIcon: string;
  rgb: string;
  dropTargetTw: string;
  selectedTw: string;
}

export const colors: Record<GraphNodeType, ColorInfo> = {
  storyInfo: {
    tw: "bg-purple-100",
    twIcon: "text-purple-600",
    rgb: "rgb(243, 232, 255)",
    dropTargetTw: "ring-purple-300/50 ring-offset-purple-300/50",
    selectedTw: "border-purple-600 shadow-[0_0_0_4px_rgba(192,132,252,0.82),0_0_0_7px_rgba(192,132,252,0.28),0_0_24px_rgba(168,85,247,0.22),0_18px_36px_-14px_rgba(147,51,234,0.42)]"
  },
  action: {
    tw: "bg-green-100",
    twIcon: "text-green-600",
    rgb: "rgb(220, 252, 231)",
    dropTargetTw: "ring-green-300/50 ring-offset-green-300/50",
    selectedTw: "border-green-600 shadow-[0_0_0_4px_rgba(74,222,128,0.82),0_0_0_7px_rgba(74,222,128,0.28),0_0_24px_rgba(34,197,94,0.2),0_18px_36px_-14px_rgba(22,163,74,0.4)]"
  },
  skip: {
    tw: "bg-cyan-100",
    twIcon: "text-cyan-600",
    rgb: "rgb(207, 250, 254)",
    dropTargetTw: "ring-cyan-300/50 ring-offset-cyan-300/50",
    selectedTw: "border-cyan-600 shadow-[0_0_0_4px_rgba(103,232,249,0.84),0_0_0_7px_rgba(103,232,249,0.3),0_0_24px_rgba(6,182,212,0.22),0_18px_36px_-14px_rgba(8,145,178,0.42)]"
  },
  redirect: {
    tw: "bg-yellow-100",
    twIcon: "text-yellow-600",
    rgb: "rgb(254, 249, 195)",
    dropTargetTw: "ring-yellow-300/50 ring-offset-yellow-300/50",
    selectedTw: "border-amber-500 shadow-[0_0_0_4px_rgba(252,211,77,0.84),0_0_0_7px_rgba(252,211,77,0.3),0_0_24px_rgba(245,158,11,0.22),0_18px_36px_-14px_rgba(217,119,6,0.42)]"
  },
  finish: {
    tw: "bg-red-100",
    twIcon: "text-red-600",
    rgb: "rgb(254, 226, 226)",
    dropTargetTw: "ring-red-300/50 ring-offset-red-300/50",
    selectedTw: "border-red-600 shadow-[0_0_0_4px_rgba(252,165,165,0.84),0_0_0_7px_rgba(252,165,165,0.3),0_0_24px_rgba(239,68,68,0.22),0_18px_36px_-14px_rgba(220,38,38,0.42)]"
  }
} as const;

export const weights = {
  min: 0,
  default: 1,
  max: 10
} as const;

export const storyInfoNodeId = 0;

export const nodeLabels: Record<GraphNodeType, string> = {
  storyInfo: "📚 Story",
  action: "Action",
  redirect: "Redirect",
  skip: "Skip",
  finish: "Finish"
} as const;

export const languages: LanguageInfo[] = [
  {
    code: "be",
    name: "Беларуская",
    flagCode: "by"
  },
  {
    code: "de",
    name: "Deutsch",
    flagCode: "de"
  },
  {
    code: "en",
    name: "English",
    flagCode: "gb"
  },
  {
    code: "es",
    name: "Español",
    flagCode: "es"
  },
  {
    code: "fr",
    name: "Français",
    flagCode: "fr"
  },
  {
    code: "hi",
    name: "हिन्दी",
    flagCode: "in"
  },
  {
    code: "hy",
    name: "Հայերեն",
    flagCode: "am"
  },
  {
    code: "it",
    name: "Italiano",
    flagCode: "it"
  },
  {
    code: "ja",
    name: "日本語",
    flagCode: "jp"
  },
  {
    code: "ka",
    name: "ქართული",
    flagCode: "ge"
  },
  {
    code: "ko",
    name: "한국어",
    flagCode: "kr"
  },
  {
    code: "pt",
    name: "Português",
    flagCode: "pt"
  },
  {
    code: "ru",
    name: "Русский",
    flagCode: "ru"
  },
  {
    code: "uk",
    name: "Українська",
    flagCode: "ua"
  },
  {
    code: "zh",
    name: "中文",
    flagCode: "cn"
  }
] as const;

const uiLanguageCodes = ["en", "es", "it", "ja", "ru"];

export const uiLanguages = languages.filter(lng => uiLanguageCodes.includes(lng.code));
