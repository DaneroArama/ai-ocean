import type { Locale } from './provider'

type Dictionary = Record<string, unknown>

/**
 * Server-side helper for loading dictionaries
 * Use this in Server Components to load translations
 *
 * @param locale - The locale to load ('en' or 'my')
 * @returns The dictionary object for the specified locale
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    const dictionary = await import(`@/dictionaries/${locale}.json`)
    return dictionary.default as Dictionary
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    const fallback = await import(`@/dictionaries/en.json`)
    return fallback.default as Dictionary
  }
}

/**
 * Synchronous dictionary loader for use in client components
 * This is used internally by the I18nProvider
 *
 * @param locale - The locale to load ('en' or 'my')
 * @returns The dictionary object for the specified locale
 */
export async function getDictionarySync(locale: Locale): Promise<Dictionary> {
  try {
    const dictionary = await import(`@/dictionaries/${locale}.json`)
    return dictionary.default as Dictionary
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    const fallback = await import(`@/dictionaries/en.json`)
    return fallback.default as Dictionary
  }
}
