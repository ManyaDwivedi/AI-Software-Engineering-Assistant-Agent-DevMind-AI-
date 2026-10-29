import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser, login as apiLogin, register as apiRegister } from './api.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'aiswe.auth'

function loadSession() {
  try {
    const persistent = localStorage.getItem(STORAGE_KEY)
    const raw = persistent || sessionStorage.getItem(STORAGE_KEY)
    const user = raw ? JSON.parse(raw) : null
    if (user?.token) return { user, ready: false, remember: Boolean(persistent) }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }
  return { user: null, ready: true, remember: true }
}

function saveSession(session, remember = true) {
  const user = { ...session.user, token: session.token }
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const { user, ready } = session

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setSession({ user: null, ready: true, remember: true })
  }, [])

  useEffect(() => {
    let active = true
    if (!user?.token) return undefined
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) {
          const refreshed = { ...currentUser, token: user.token }
          const storage = session.remember ? localStorage : sessionStorage
          storage.setItem(STORAGE_KEY, JSON.stringify(refreshed))
          setSession({ user: refreshed, ready: true, remember: session.remember })
        }
      })
      .catch((error) => {
        if (active && error.status === 401) logout()
      })
      .finally(() => {
        if (active) setSession((current) => ({ ...current, ready: true }))
      })

    return () => {
      active = false
    }
  }, [logout, session.remember, user?.token])

  useEffect(() => {
    window.addEventListener('aiswe:unauthorized', logout)
    return () => window.removeEventListener('aiswe:unauthorized', logout)
  }, [logout])

  const login = useCallback(async (email, password, remember = true) => {
    const authenticatedSession = await apiLogin(email, password)
    const authenticatedUser = saveSession(authenticatedSession, remember)
    setSession({ user: authenticatedUser, ready: true, remember })
    return authenticatedUser
  }, [])

  const register = useCallback(async (name, email, password) => {
    const session = await apiRegister(name, email, password)
    const authenticatedUser = saveSession(session)
    setSession({ user: authenticatedUser, ready: true, remember: true })
    return authenticatedUser
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
