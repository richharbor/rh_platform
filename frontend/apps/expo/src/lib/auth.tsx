import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

import { apiFetch } from './api'

type AuthUser = {
  id: number
  email: string
  name?: string | null
  onboarding_completed: boolean
  role?: string | null
  email_verified_at?: string | null
  phone?: string | null
  pan?: string | null
  company_name?: string | null
  gst_number?: string | null
  experience_years?: string | null
  existing_client_base?: string | null
  full_name?: string | null
  username?: string | null
  dob?: string | null
  country?: string | null
  address_line?: string | null
  city?: string | null
  postcode?: string | null
  profile_completed_at?: string | null
  is_profile_complete?: boolean
}

type AuthResponse = {
  access_token: string
  refresh_token: string | null
  token_type: string
  user: AuthUser
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  signIn: (payload: { email: string; password: string }) => Promise<AuthUser>
  signUp: (payload: {
    email: string
    password: string
    name?: string
    role: string
    phone?: string
    city?: string
    pan?: string
    company_name?: string
    gst_number?: string
    experience_years?: string
    existing_client_base?: string
  }) => Promise<AuthUser>
  signOut: () => Promise<void>
  requestSignupOtp: (payload: { email: string }) => Promise<void>
  verifySignupOtp: (payload: { email: string; otp: string }) => Promise<string>
  completeSignup: (payload: { signup_token: string; password: string; phone: string }) => Promise<AuthUser>
  completeOnboarding: () => Promise<AuthUser>
  updateProfile: (payload: Record<string, unknown>) => Promise<AuthUser>
  refreshUser: () => Promise<AuthUser | null>
}

const ACCESS_TOKEN_KEY = 'rh_access_token'
const REFRESH_TOKEN_KEY = 'rh_refresh_token'

const AuthContext = createContext<AuthContextValue | null>(null)

async function getStoredTokens() {
  if (Platform.OS === 'web') {
    // expo-secure-store isn't available on web in the same way; fall back to localStorage
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    return { accessToken, refreshToken }
  }

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ])
  return { accessToken, refreshToken }
}

async function saveTokens(accessToken: string, refreshToken: string | null) {
  if (Platform.OS === 'web') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
    return
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  }
}

async function clearTokens() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    return
  }

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setSession = (
    authUser: AuthUser | null,
    nextAccess: string | null,
    nextRefresh: string | null
  ) => {
    setUser(authUser)
    setAccessToken(nextAccess)
    setRefreshToken(nextRefresh)
  }

  const refreshWithToken = async (token: string) => {
    const refreshed = await apiFetch<AuthResponse>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: token }),
    })
    await saveTokens(refreshed.access_token, refreshed.refresh_token)
    setSession(refreshed.user, refreshed.access_token, refreshed.refresh_token)
    return refreshed.user
  }

  const refreshUser = async () => {
    if (!accessToken) {
      return null
    }
    try {
      const profile = await apiFetch<AuthUser>('/v1/auth/me', {
        token: accessToken,
      })
      setUser(profile)
      return profile
    } catch (error) {
      if (refreshToken) {
        try {
          return await refreshWithToken(refreshToken)
        } catch (refreshError) {
          await clearTokens()
          setSession(null, null, null)
          return null
        }
      }
      await clearTokens()
      setSession(null, null, null)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const stored = await getStoredTokens()
        if (!isMounted) return
        if (!stored.accessToken) {
          setIsLoading(false)
          return
        }
        setAccessToken(stored.accessToken)
        setRefreshToken(stored.refreshToken)

        const profile = await apiFetch<AuthUser>('/v1/auth/me', {
          token: stored.accessToken,
        }).catch(async () => {
          if (stored.refreshToken) {
            return refreshWithToken(stored.refreshToken)
          }
          return null
        })

        if (!isMounted) return
        if (profile) {
          setUser(profile)
        } else {
          await clearTokens()
          setUser(null)
          setAccessToken(null)
          setRefreshToken(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = async (payload: { email: string; password: string }) => {
    const response = await apiFetch<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await saveTokens(response.access_token, response.refresh_token)
    setSession(response.user, response.access_token, response.refresh_token)
    return response.user
  }

  const signUp = async (payload: {
    email: string
    password: string
    name?: string
    role: string
    phone?: string
    city?: string
    pan?: string
    company_name?: string
    gst_number?: string
    experience_years?: string
    existing_client_base?: string
  }) => {
    const response = await apiFetch<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await saveTokens(response.access_token, response.refresh_token)
    setSession(response.user, response.access_token, response.refresh_token)
    return response.user
  }

  const signOut = async () => {
    await clearTokens()
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }

  const requestSignupOtp = async (payload: { email: string }) => {
    await apiFetch('/v1/auth/signup/request-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const verifySignupOtp = async (payload: { email: string; otp: string }) => {
    const res = await apiFetch<{ signup_token: string }>('/v1/auth/signup/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.signup_token
  }

  const completeSignup = async (payload: { signup_token: string; password: string; phone: string }) => {
    const response = await apiFetch<AuthResponse>('/v1/auth/signup/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await saveTokens(response.access_token, response.refresh_token)
    setSession(response.user, response.access_token, response.refresh_token)
    return response.user
  }

  const completeOnboarding = async () => {
    if (!accessToken) {
      throw new Error('Not authenticated')
    }
    const updated = await apiFetch<AuthUser>('/v1/profile/onboarding', {
      method: 'PATCH',
      token: accessToken,
      body: JSON.stringify({ onboarding_completed: true }),
    })
    setUser(updated)
    return updated
  }

  const updateProfile = async (payload: Record<string, unknown>) => {
    if (!accessToken) {
      throw new Error('Not authenticated')
    }
    const updated = await apiFetch<AuthUser>('/v1/me/profile', {
      method: 'PUT',
      token: accessToken,
      body: JSON.stringify(payload),
    })
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        signIn,
        signUp,
        signOut,
        requestSignupOtp,
        verifySignupOtp,
        completeSignup,
        completeOnboarding,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
