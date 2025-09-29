'use client'

import { useState, useEffect, useCallback } from 'react'

const ADMIN_ROUTE = '/admin'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}

interface LoginCredentials {
  username: string
  password: string
}

const redirectToAdmin = () => {
  window.location.href = ADMIN_ROUTE
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('admin_token')
        const expiry = localStorage.getItem('admin_token_expiry')

        if (token && expiry) {
          const expiryTime = parseInt(expiry)
          const currentTime = Date.now()

          if (currentTime < expiryTime) {
            setAuthState({ isAuthenticated: true, isLoading: false })
            return
          }

          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_token_expiry')
        }

        setAuthState({ isAuthenticated: false, isLoading: false })
      } catch (err) {
        console.error('Auth check error:', err)
        setAuthState({ isAuthenticated: false, isLoading: false })
      }
    }

    checkAuthStatus()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null)

    try {
      const { username, password } = credentials

      if (username === 'news2025' && password === '2025news') {
        const token = btoa(`${username}:${Date.now()}`)
        const expiry = Date.now() + 24 * 60 * 60 * 1000

        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_token_expiry', expiry.toString())

        redirectToAdmin()
        return true
      }

      setError('Invalid username or password')
      return false
    } catch {
      setError('Login failed')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_expiry')
    redirectToAdmin()
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,
    login,
    logout,
    clearError
  }
}
