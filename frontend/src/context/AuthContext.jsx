import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = '/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && role) {
      setUser({ token, role })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      })
      const { access_token, role } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('role', role)
      setUser({ token: access_token, role })
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.detail || 'Login gagal. Periksa username dan password.'
      return { success: false, message }
    }
  }

  const register = async (username, password, role = 'viewer') => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { username, password, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail || 'Registrasi gagal.'
      return { success: false, message }
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/auth/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.detail || 'Gagal mengubah password.'
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setUser(null)
  }

  const isAuthenticated = !!user
  const isSuperadmin = user?.role === 'superadmin'
  const isEditor = user?.role === 'editor' || user?.role === 'superadmin'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        changePassword,
        logout,
        isAuthenticated,
        isSuperadmin,
        isEditor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
