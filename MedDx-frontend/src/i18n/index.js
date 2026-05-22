import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

const STORAGE_KEY = 'meddx_lang'
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr']

const resolveInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

// Persist any language change so it survives page reloads.
i18n.on('languageChanged', (lng) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lng)
    document.documentElement.lang = lng
  } catch {
    // noop
  }
})
document.documentElement.lang = i18n.language

export default i18n
