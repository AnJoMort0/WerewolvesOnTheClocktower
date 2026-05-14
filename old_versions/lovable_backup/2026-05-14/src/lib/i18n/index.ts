import { createContext, useContext } from "react";
import type { RoleId } from "@/lib/roles";
import type { Language, Translation, ScriptLine, ScriptDynamicStrings, UIStrings } from "./types";
import { pt } from "./pt";
import { fr } from "./fr";

export type { Language, Translation, ScriptLine, ScriptDynamicStrings, UIStrings };
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

export function getDynamic(lang: Language): ScriptDynamicStrings {
  return getTranslation(lang).scriptDynamic;
}

export function t(key: keyof UIStrings, lang: Language): string {
  return getTranslation(lang).ui[key] ?? String(key);
}

export const LanguageContext = createContext<Language>("pt");

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function useT() {
  const lang = useLanguage();
  return (key: keyof UIStrings) => t(key, lang);
}

export function useRoleLabel() {
  const lang = useLanguage();
  return (roleId: RoleId) => getRoleLabel(roleId, lang);
}
