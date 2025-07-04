import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({ user: data.user })
      toast.success('Successfully signed in!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      throw error
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        toast.success('Account created! Please check your email to confirm your account.', {
          duration: 6000
        })
        return
      }

      // If session exists, user is automatically signed in
      if (data.session) {
        set({ user: data.user })
        toast.success('Account created and signed in successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
      throw error
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({ user: null })
      toast.success('Successfully signed out!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user || null, loading: false })

      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user || null, loading: false })
        
        // Handle successful email confirmation
        if (event === 'SIGNED_IN' && session) {
          toast.success('Email confirmed! Welcome to your CRM.')
        }
      })
    } catch (error) {
      set({ loading: false })
    }
  },
}))

// Initialize auth on app start
useAuthStore.getState().initialize()
