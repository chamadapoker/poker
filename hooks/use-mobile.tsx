"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind's 'md' breakpoint is 768px
    }

    checkIsMobile() // Check on initial render
    window.addEventListener("resize", checkIsMobile) // Add event listener for window resize

    return () => {
      window.removeEventListener("resize", checkIsMobile) // Clean up the event listener
    }
  }, [])

  return isMobile
}
