"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
  isMobileOpen: boolean
  toggleMobile: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}

interface MobileMenuProviderProps {
  children: ReactNode
}

export function MobileMenuProvider({ children }: MobileMenuProviderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <MobileMenuContext.Provider value={{ isMobileOpen, toggleMobile }}>
      {children}
    </MobileMenuContext.Provider>
  )
}
