import { createContext, useContext } from "react";
import type { RoleId } from "@/lib/roles";
import type { Language, Translation, ScriptLine } from "./types";
import { pt } from "./pt";
import { fr } from "./fr";

export type { Language, Translation, ScriptLine };
export { SUPPORTED_LANGUAGES } from "./types";

const TRANSLATIONS: Record<Language, Translation> = { pt, fr };

export function getTranslation(lang: Language): Translation {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.pt;
}

export function getRoleLabel(roleId: RoleId, lang: Language): string {
  return getTranslation(lang).roleLabels[roleId];
}

export function getScripts(lang: Language) {
  return getTranslation(lang).scripts;
}

export function t(key: string, lang: Language): string {
  return getTranslation(lang).ui[key] ?? key;
}

export const LanguageContext = createContext<Language>("pt");

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function useT() {
  const lang = useLanguage();
  return (key: string) => t(key, lang);
}

export function useRoleLabel() {
  const lang = useLanguage();
  return (roleId: RoleId) => getRoleLabel(roleId, lang);
}
