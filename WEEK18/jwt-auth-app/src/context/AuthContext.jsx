import { createContext, useContext, useState, useCallback } from 'react'
import { axiosPrivate } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  /*
   * TOKEN STORAGE STRATEGY
   * ─────────────────────
   * access_token  → React state (memory only).
   *   Reason: Never hits the DOM/storage, invisible to XSS.
   *   Tradeoff: Lost on page refresh — handled by /api/refresh on mount.
   *
   * refresh_token → httpOnly cookie (set by backend, not accessible via JS).
   *   Reason: httpOnly cookies are immune to XSS.
   *   Tradeoff: Requires CSRF protection on the refresh endpoint (backend concern).
   *
   * If httpOnly cookies aren't available (e.g. dev/mock), localStorage is used
   * as a fallback — clearly less secure but sometimes necessary.
   */
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)

  const isAuthenticated = !!accessToken

  /**
   * login() — called after successful /api/login
   * Stores user info + access token in memory state.
   */
  const login = useCallback((userData, token) => {
    setUser(userData)
    setAccessToken(token)
  }, [])

  /**
   * logout() — clears all auth state.
   * Backend should also invalidate the refresh token cookie.
   */
  const logout = useCallback(async () => {
    try {
      // Tell backend to clear the httpOnly refresh cookie
      await axiosPrivate.post('/api/logout')
    } catch {
      // Ignore errors — clear local state regardless
    } finally {
      setUser(null)
      setAccessToken(null)
    }
  }, [])

  /**
   * updateAccessToken() — called by the Axios interceptor after a silent refresh.
   * This keeps the in-memory token in sync without triggering a full login flow.
   */
  const updateAccessToken = useCallback((token) => {
    setAccessToken(token)
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, login, logout, updateAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Custom hook — enforces context is used inside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
