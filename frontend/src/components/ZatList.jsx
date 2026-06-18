import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiShield, FiArrowLeft, FiAlertTriangle, FiInfo } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function ZatList() {
  const [zatList, setZatList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedZat, setSelectedZat] = useState(null)

  useEffect(() => {
    fetchZat()
  }, [])

  const fetchZat = async () => {
    try {
      const response = await axios.get(`${API_URL}/zat`)
      setZatList(response.data)
    } catch (error) {
      console.error('Error fetching zat:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiShield className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">SPZKB</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-primary-600 flex items-center gap-1">
              <FiArrowLeft /> Kembali
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zat Kimia Berbahaya</h1>
        <p className="text-gray-600 mb-8">
          Informasi lengkap tentang zat kimia berbahaya yang sering disalahgunakan dalam makanan.
        </p>

        <div className="grid gap-6">
          {zatList.map((zat) => (
            <div key={zat.id} className="card hover:shadow-md transition-shadow">
              <button
                onClick={() => setSelectedZat(selectedZat?.id === zat.id ? null : zat)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
                      <FiAlertTriangle className="text-danger-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{zat.nama}</h3>
                      <p className="text-sm text-gray-500">{zat.kode}</p>
                    </div>
                  </div>
                  <FiInfo className={`text-gray-400 transition-transform ${selectedZat?.id === zat.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {selectedZat?.id === zat.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                  <div className="mb-4">
                    <h4 className="font-medium text-danger-700 flex items-center gap-2 mb-2">
                      <FiAlertTriangle className="w-4 h-4" />
                      Efek Kesehatan
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{zat.efek_kesehatan}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-700 flex items-center gap-2 mb-2">
                      <FiInfo className="w-4 h-4" />
                      Solusi
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{zat.solusi}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ZatList
