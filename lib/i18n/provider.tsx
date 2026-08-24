'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Locale = 'en' | 'my'
type Dictionary = Record<string, any>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dictionary: Dictionary
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
  initialDictionary?: Dictionary
}

export function I18nProvider({ 
  children, 
  initialLocale = 'en',
  initialDictionary = {}
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // Load from localStorage on mount
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'my')) {
      setLocaleState(savedLocale)
      loadDictionary(savedLocale)
    }
  }, [])
  
  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (isClient) {
      localStorage.setItem('locale', newLocale)
    }
    await loadDictionary(newLocale)
  }
  
  const loadDictionary = async (loc: Locale) => {
    try {
      const dict = await import(`@/dictionaries/${loc}.json`)
      setDictionary(dict.default)
    } catch (error) {
      console.error(`Failed to load dictionary for locale: ${loc}`, error)
    }
  }
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = dictionary
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    return typeof value === 'string' ? value : key
  }
  
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dictionary }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
