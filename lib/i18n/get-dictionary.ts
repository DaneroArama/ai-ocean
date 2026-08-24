import type { Locale } from './provider'

// Dictionary type definition
type Dictionary = Record<string, any>

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
    return dictionary.default
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    // Fallback to English if the requested locale fails
    const fallback = await import(`@/dictionaries/en.json`)
    return fallback.default
  }
}

/**
 * Synchronous dictionary loader for use in client components
 * This is used internally by the I18nProvider
 * 
 * @param locale - The locale to load ('en' or 'my')
 * @returns The dictionary object for the specified locale
 */
export function getDictionarySync(locale: Locale): Dictionary {
  try {
    // This will be handled by the provider's dynamic import
    return require(`@/dictionaries/${locale}.json`)
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    return require(`@/dictionaries/en.json`)
  }
}
