/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  role?: string
  tenantIds?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // For now, we'll simulate a login since you don't have the backend yet
          // Replace this with your actual login API call when ready
          console.log('Attempting login with:', { email, password })
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock successful login response
          // In a real app, this would come from your backend
          const mockUser: User = {
            id: '1',
            email: email,
            name: email.split('@')[0], // Simple name from email
            role: 'user'
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          // Set token in cookies for SSR
          Cookies.set('token', mockToken, { expires: 7 })
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          console.log('Login successful')
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: () => {
        Cookies.remove('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: () => {
        const token = Cookies.get('token')
        
        if (token) {
          set({ 
            token,
            isAuthenticated: true,
            // Note: In a real app, you'd validate the token with your backend
            user: get().user // Keep existing user or fetch new one
          })
        } else {
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)