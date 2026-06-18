import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = '/api'

const defaultBranding = {
  app_name: 'SPZKB',
  app_title: 'Sistem Pakar Zat Kimia pada Makanan',
  logo_url: '',
  favicon_url: '',
}

const BrandingContext = createContext({
  branding: defaultBranding,
  loading: true,
  updateBranding: async () => {},
})

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`)
        setBranding((prev) => ({ ...prev, ...response.data }))
      } catch (error) {
        const saved = localStorage.getItem('spzkb_branding')
        if (saved) {
          setBranding((prev) => ({ ...prev, ...JSON.parse(saved) }))
        }
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [])

  useEffect(() => {
    document.title = branding.app_title || branding.app_name || 'SPZKB'

    const favicon = document.querySelector("link[rel~='icon']")
    if (favicon && branding.favicon_url) {
      favicon.href = branding.favicon_url
    }

    localStorage.setItem('spzkb_branding', JSON.stringify(branding))
  }, [branding])

  const updateBranding = async (values) => {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/settings`, values, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setBranding((prev) => ({ ...prev, ...response.data }))
    return response.data
  }

  return (
    <BrandingContext.Provider value={{ branding, loading, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  return useContext(BrandingContext)
}

export default BrandingContext
