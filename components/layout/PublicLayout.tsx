'use client'

import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { IntroSplash } from './IntroSplash'
import React from "react";

/**
 * Public Layout Component
 * 
 * Layout wrapper for the public-facing website pages including:
 * - Home page
 * - Event information
 * - Characters page
 * - Speaker page
 * - Registration page
 * 
 * Features:
 * - Sticky navbar at top
 * - Main content area
 * - Footer at bottom
 * - Full-screen layout structure
 */

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-ocean-primary">
      <IntroSplash />
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}