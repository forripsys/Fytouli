import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextValue {
    isDark: boolean
    toggleTheme: () => void
    setDark: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem('theme')
            if (stored === 'dark') return true
            if (stored === 'light') return false
        } catch {}

        // default to system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }

        return false
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) root.classList.add('dark')
        else root.classList.remove('dark')

        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light')
        } catch {}
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setDark: setIsDark }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}

export default ThemeProvider
