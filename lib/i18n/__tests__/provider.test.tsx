import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { I18nProvider, useI18n } from '../provider'
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test component that uses i18n
function TestComponent() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div>
      <div data-testid="current-locale">{locale}</div>
      <div data-testid="translated-text">{t('nav.home')}</div>
      <button onClick={() => setLocale('my')} data-testid="switch-to-my">
        Switch to Myanmar
      </button>
      <button onClick={() => setLocale('en')} data-testid="switch-to-en">
        Switch to English
      </button>
    </div>
  )
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should provide default locale as English', () => {
    const initialDict = { nav: { home: 'Home' } }
    
    render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('current-locale')).toHaveTextContent('en')
  })

  it('should translate keys using the dictionary', () => {
    const initialDict = { nav: { home: 'Home' } }
    
    render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('translated-text')).toHaveTextContent('Home')
  })

  it('should return key when translation is missing', () => {
    const initialDict = { nav: {} }
    
    function MissingKeyTestComponent() {
      const { t } = useI18n()
      return <div data-testid="missing-key">{t('nav.missing')}</div>
    }
    
    render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <MissingKeyTestComponent />
      </I18nProvider>
    )

    // Should return the key itself when translation is missing
    expect(screen.getByTestId('missing-key')).toHaveTextContent('nav.missing')
  })

  it('should persist locale to localStorage when changed', async () => {
    const initialDict = { nav: { home: 'Home' } }
    
    render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <TestComponent />
      </I18nProvider>
    )

    const switchButton = screen.getByTestId('switch-to-my')
    
    await act(async () => {
      switchButton.click()
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    await waitFor(() => {
      expect(localStorageMock.getItem('locale')).toBe('my')
    })
  })

  it('should throw error when useI18n is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useI18n must be used within I18nProvider')

    consoleError.mockRestore()
  })

  it('should handle nested dictionary keys', () => {
    const initialDict = { 
      home: { 
        hero: { 
          title: 'Discover Your Ocean Personality' 
        } 
      } 
    }
    
    function NestedTestComponent() {
      const { t } = useI18n()
      return <div data-testid="nested-key">{t('home.hero.title')}</div>
    }

    render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <NestedTestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('nested-key')).toHaveTextContent('Discover Your Ocean Personality')
  })

  it('should support Myanmar locale', () => {
    const myanmarDict = { nav: { home: 'ပင်မစာမျက်နှာ' } }
    
    render(
      <I18nProvider initialLocale="my" initialDictionary={myanmarDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('current-locale')).toHaveTextContent('my')
    expect(screen.getByTestId('translated-text')).toHaveTextContent('ပင်မစာမျက်နှာ')
  })
})

describe('I18nProvider - Requirements Validation', () => {
  /**
   * Validates: Requirements 1.2, 1.4, 20.1, 20.2, 20.3, 20.6
   */
  
  it('should persist language preference across sessions (Req 20.2)', async () => {
    const initialDict = { nav: { home: 'Home' } }
    
    const { unmount } = render(
      <I18nProvider initialLocale="en" initialDictionary={initialDict}>
        <TestComponent />
      </I18nProvider>
    )

    const switchButton = screen.getByTestId('switch-to-my')
    
    await act(async () => {
      switchButton.click()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    await waitFor(() => {
      expect(localStorageMock.getItem('locale')).toBe('my')
    })

    unmount()

    // Simulate new session - localStorage should still have the preference
    expect(localStorageMock.getItem('locale')).toBe('my')
  })

  it('should maintain separate translation files for both languages (Req 20.3)', () => {
    // This test validates the structure supports both dictionaries
    const enDict = { nav: { home: 'Home' } }
    const myDict = { nav: { home: 'ပင်မစာမျက်နှာ' } }

    const { unmount } = render(
      <I18nProvider initialLocale="en" initialDictionary={enDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('translated-text')).toHaveTextContent('Home')

    // Unmount and remount with different locale
    unmount()
    
    render(
      <I18nProvider initialLocale="my" initialDictionary={myDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('translated-text')).toHaveTextContent('ပင်မစာမျက်နှာ')
  })

  it('should default to English when no preference is stored (Req 1.4)', () => {
    localStorageMock.clear()
    const initialDict = { nav: { home: 'Home' } }
    
    render(
      <I18nProvider initialDictionary={initialDict}>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('current-locale')).toHaveTextContent('en')
  })
})
