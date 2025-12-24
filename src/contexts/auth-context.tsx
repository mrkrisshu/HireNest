"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
    id: string
    email: string
    role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
    profile?: {
        photo_url?: string | null
        company_name?: string | null
        phone?: string | null
        resume_url?: string | null
    } | null
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const data = await response.json()
                if (data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const refreshUser = async () => {
        await fetchUser()
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
