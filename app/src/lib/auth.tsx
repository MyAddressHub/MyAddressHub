"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI, userAPI } from "./api"

// Define types
type User = {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    date_joined: string
    last_login: string
    profile: {
        id: string
        bio: string
        avatar: string | null
        phone_number: string
        user_type: "individual" | "organization"
        organization_role?: string | null
        can_manage_organization_users?: boolean
        organization?: {
            id: string
            name: string
            description: string
            is_active: boolean
            created_at: string
            updated_at: string
        }
        created_at: string
        updated_at: string
    }
}

type AuthContextType = {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    register: (userData: any) => Promise<void>
    updateProfile: (profileData: any) => Promise<void>
    refreshUser: () => Promise<void>
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
    register: async () => {},
    updateProfile: async () => {},
    refreshUser: async () => {},
})

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            // Set a timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                console.log("Auth check timeout, setting isLoading to false")
                setIsLoading(false)
            }, 2000) // 2 second timeout

            try {
                const accessToken = localStorage.getItem("accessToken")
                if (!accessToken) {
                    console.log("No token found, user is not authenticated")
                    clearTimeout(timeoutId)
                    setIsLoading(false)
                    return
                }

                console.log("Token found, checking user profile...")
                setToken(accessToken)
                const response = await userAPI.getProfile()
                console.log("User profile loaded:", response.data)
                setUser(response.data)
            } catch (error) {
                console.error("Authentication check failed:", error)
                // Clear tokens if auth check fails
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                setUser(null)
            } finally {
                clearTimeout(timeoutId)
                console.log("Setting isLoading to false")
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    // Login function
    const login = async (username: string, password: string) => {
        try {
            // First, ensure we're logged out
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)

            // Perform login
            const authResponse = await authAPI.login(username, password)

            // Verify tokens were set
            const accessToken = localStorage.getItem("accessToken")
            if (!accessToken) {
                throw new Error("Login failed: No token received")
            }

            // Set token and fetch user profile
            setToken(accessToken)
            const userResponse = await userAPI.getProfile()
            setUser(userResponse.data)

            // Only navigate on success
            router.replace("/")
        } catch (error) {
            console.error("Login failed:", error)
            // Ensure we're fully logged out on error
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
            throw error // Re-throw the error to be handled by the login page
        }
    }

    // Logout function
    const logout = () => {
        // Clear all auth state
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setUser(null)
        setToken(null)

        // Navigate to login
        router.replace("/auth/login")
    }

    // Register function
    const register = async (userData: any) => {
        setIsLoading(true)
        try {
            await authAPI.register(userData)
            router.push("/auth/login")
        } catch (error) {
            console.error("Registration failed:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Update profile function
    const updateProfile = async (profileData: any) => {
        setIsLoading(true)
        try {
            const response = await userAPI.updateProfile(profileData)
            setUser((prevUser) => {
                if (!prevUser) return null
                return {
                    ...prevUser,
                    profile: {
                        ...prevUser.profile,
                        ...response.data,
                    },
                }
            })
        } catch (error) {
            console.error("Profile update failed:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const refreshUser = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken")
            if (!accessToken) {
                console.log("No token found for refresh")
                return
            }

            console.log("Refreshing user profile...")
            setToken(accessToken)
            const response = await userAPI.getProfile()
            console.log("User profile refreshed:", response.data)
            setUser(response.data)
        } catch (error) {
            console.error("User refresh failed:", error)
            // Clear tokens if refresh fails
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
            setToken(null)
        }
    }

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateProfile,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Auth guard component for protected routes
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? <>{children}</> : null
}
