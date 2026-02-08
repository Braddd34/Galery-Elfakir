"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {}
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  
  // Charger le thème sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved && (saved === "dark" || saved === "light")) {
      setTheme(saved)
    }
    setMounted(true)
  }, [])
  
  // Appliquer le thème au document
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    
    if (theme === "light") {
      root.classList.remove("dark")
      root.classList.add("light")
      root.style.colorScheme = "light"
    } else {
      root.classList.remove("light")
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    }
    
    localStorage.setItem("theme", theme)
  }, [theme, mounted])
  
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
