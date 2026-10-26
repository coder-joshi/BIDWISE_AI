import { create } from 'zustand'
import { translations } from '../i18n/translations'

const INITIAL_LANG = typeof window !== 'undefined'
  ? localStorage.getItem('gem_language') || 'en'
  : 'en'

export const useLanguageStore = create((set, get) => ({
  language: INITIAL_LANG,
  setLanguage: (lang) => {
    try {
      localStorage.setItem('gem_language', lang)
    } catch {}
    set({ language: lang })
  },
  t: (key, fallback = '') => {
    const lang = get().language || 'en'
    return translations[lang]?.[key] ?? fallback ?? key
  },
}))

export function useLanguage() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const t = (key, fallback = '') => {
    return translations[language]?.[key] ?? fallback ?? key
  }
  return { language, setLanguage, t }
}

export function t(key, fallback = '') {
  return useLanguageStore.getState().t(key, fallback)
}
