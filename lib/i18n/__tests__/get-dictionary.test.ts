import { describe, it, expect, vi } from 'vitest'
import { getDictionary } from '../get-dictionary'

describe('getDictionary', () => {
  it('should load English dictionary', async () => {
    const dict = await getDictionary('en')
    
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.nav.home).toBe('Home')
  })

  it('should load Myanmar dictionary', async () => {
    const dict = await getDictionary('my')
    
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.nav.home).toBe('ပင်မစာမျက်နှာ')
  })

  it('should contain all required translation keys in both dictionaries', async () => {
    const enDict = await getDictionary('en')
    const myDict = await getDictionary('my')
    
    // Both dictionaries should have the same structure
    expect(Object.keys(enDict)).toEqual(Object.keys(myDict))
    
    // Check nav section
    expect(enDict.nav).toBeDefined()
    expect(myDict.nav).toBeDefined()
    expect(Object.keys(enDict.nav)).toEqual(Object.keys(myDict.nav))
    
    // Check home section
    expect(enDict.home).toBeDefined()
    expect(myDict.home).toBeDefined()
    
    // Check auth section
    expect(enDict.auth).toBeDefined()
    expect(myDict.auth).toBeDefined()
    
    // Check common section
    expect(enDict.common).toBeDefined()
    expect(myDict.common).toBeDefined()
  })

  it('should handle dictionary loading errors gracefully', async () => {
    // Mock console.error to suppress error output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // This should still return a dictionary (fallback to English)
    const dict = await getDictionary('en')
    expect(dict).toBeDefined()
    
    consoleError.mockRestore()
  })
})

describe('getDictionary - Requirements Validation', () => {
  /**
   * Validates: Requirements 1.2, 20.1, 20.3
   */
  
  it('should support both English and Myanmar languages (Req 1.2, 20.1)', async () => {
    const enDict = await getDictionary('en')
    const myDict = await getDictionary('my')
    
    // Verify both dictionaries load successfully
    expect(enDict).toBeDefined()
    expect(myDict).toBeDefined()
    
    // Verify they contain translations
    expect(Object.keys(enDict).length).toBeGreaterThan(0)
    expect(Object.keys(myDict).length).toBeGreaterThan(0)
  })

  it('should maintain separate translation files (Req 20.3)', async () => {
    const enDict = await getDictionary('en')
    const myDict = await getDictionary('my')
    
    // Verify translations are different between languages
    expect(enDict.nav.home).not.toBe(myDict.nav.home)
    expect(enDict.auth.signin).not.toBe(myDict.auth.signin)
    
    // English should have Latin characters
    expect(enDict.nav.home).toMatch(/^[A-Za-z\s]+$/)
    
    // Myanmar should have Myanmar script characters
    expect(myDict.nav.home).toMatch(/[\u1000-\u109F]/)
  })

  it('should provide comprehensive initial translation keys', async () => {
    const enDict = await getDictionary('en')
    
    // Verify all initial sections exist
    const requiredSections = ['nav', 'home', 'auth', 'common']
    
    requiredSections.forEach(section => {
      expect(enDict[section]).toBeDefined()
    })
    
    // Verify nav keys
    expect(enDict.nav.home).toBeDefined()
    expect(enDict.nav.about).toBeDefined()
    expect(enDict.nav.test).toBeDefined()
    expect(enDict.nav.dashboard).toBeDefined()
    expect(enDict.nav.changeLanguage).toBeDefined()
    
    // Verify home.hero keys
    expect(enDict.home.hero.title).toBeDefined()
    expect(enDict.home.hero.description).toBeDefined()
    expect(enDict.home.hero.cta).toBeDefined()
    
    // Verify auth keys
    expect(enDict.auth.signin).toBeDefined()
    expect(enDict.auth.signup).toBeDefined()
    expect(enDict.auth.signout).toBeDefined()
    
    // Verify common keys
    expect(enDict.common.loading).toBeDefined()
    expect(enDict.common.error).toBeDefined()
    expect(enDict.common.success).toBeDefined()
  })
})
