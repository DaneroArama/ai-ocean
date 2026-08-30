'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/provider'
import { useState } from 'react'
import eventTitle from "@/app/assets/Title.png";
import Image from "next/image";

import uxmmLogo from "@/app/assets/uxmm_logo.svg"

/**
 * Navbar Component
 * 
 * Matches the design from the image with:
 * - Blue gradient background
 * - UX mm logo on the left
 * - Navigation links: Home, Event, Characters, Speaker
 * - Register button on the right
 * - Responsive mobile menu
 */
export function Navbar() {
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-[1030] bg-white/10 backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={uxmmLogo}
              alt="UXMM Logo"
              width={50}
              height={50}
              className="h-full w-12"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
            >
              Home
            </Link>
            <Link
              href="/event"
              className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
            >
              Event
            </Link>
            <Link
              href="/characters"
              className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
            >
              Characters
            </Link>
            <Link
              href="/speaker"
              className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
            >
              Speaker
            </Link>
          </div>

          {/* Desktop Register Button */}
          <div className="hidden md:flex">
            <Link
              href="/register"
              className="font-syne [text-shadow:0_1.95px_0_#00000033] px-6 py-2 text-white border border-white/30 rounded-full hover:brightness-110 transition-all font-medium btn-radial-noise"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ocean-primary/95 backdrop-blur-sm border-t border-white/10 animate-slide-in-top">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/event"
              onClick={closeMobileMenu}
              className="block font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
            >
              Event
            </Link>
            <Link
              href="/characters"
              onClick={closeMobileMenu}
              className="block font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
            >
              Characters
            </Link>
            <Link
              href="/speaker"
              onClick={closeMobileMenu}
              className="block font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
            >
              Speaker
            </Link>

            {/* Mobile Register Button */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/register"
                onClick={closeMobileMenu}
                className="block w-full font-syncopate px-6 py-3 text-center text-white border border-white/30 rounded-full hover:brightness-110 transition-all font-medium btn-radial-noise"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
