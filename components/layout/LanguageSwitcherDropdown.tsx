'use client'

import { useI18n, type Locale } from '@/lib/i18n/provider'
import { useState, useRef, useEffect } from 'react'

/**
 * Language Switcher Dropdown Component
 * 
 * Features:
 * - Current language display with flag emoji
 * - Dropdown menu with language options
 * - Checkmark for active language
 * - Click outside to close
 * - Keyboard accessible
 * - Smooth animations
 */

interface Language {
  code: Locale
  label: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' }
]

export function LanguageSwitcherDropdown() {
  const { locale, setLocale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === locale)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-ocean-foam transition-colors"
        aria-label={t('nav.changeLanguage')}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-xl" role="img" aria-label={currentLanguage?.label}>
          {currentLanguage?.flag}
        </span>
        <span className="font-quicksand font-medium text-comic-dark">
          {currentLanguage?.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 text-comic-dark transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg border border-ocean-foam py-2 z-dropdown animate-fade-in"
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-ocean-foam transition-colors ${
                locale === lang.code ? 'bg-ocean-surface/30' : ''
              }`}
              role="menuitem"
            >
              <span className="text-xl" role="img" aria-label={lang.label}>
                {lang.flag}
              </span>
              <span className={`font-quicksand font-medium flex-1 text-left ${
                locale === lang.code ? 'text-ocean-primary' : 'text-comic-dark'
              }`}>
                {lang.label}
              </span>
              {locale === lang.code && (
                <svg
                  className="w-5 h-5 text-ocean-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
