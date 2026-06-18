import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiShield, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function MakananList() {
  const [makananList, setMakananList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMakanan, setSelectedMakanan] = useState(null)
  const [makananZat, setMakananZat] = useState({})

  useEffect(() => {
    fetchMakanan()
  }, [])

  const fetchMakanan = async () => {
    try {
      const response = await axios.get(`${API_URL}/makanan`)
      setMakananList(response.data)
    } catch (error) {
      console.error('Error fetching makanan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (makanan) => {
    if (selectedMakanan?.id === makanan.id) {
      setSelectedMakanan(null)
      return
    }
    setSelectedMakanan(makanan)
    if (!makananZat[makanan.id]) {
      try {
        const response = await axios.get(`${API_URL}/makanan/${makanan.id}/zat`)
        setMakananZat((prev) => ({ ...prev, [makanan.id]: response.data }))
      } catch (error) {
        console.error('Error fetching zat for makanan:', error)
      }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jenis Makanan</h1>
        <p className="text-gray-600 mb-8">
          Daftar makanan yang sering mengandung zat kimia berbahaya.
        </p>

        <div className="grid gap-6">
          {makananList.map((makanan) => (
            <div key={makanan.id} className="card hover:shadow-md transition-shadow">
              <button
                onClick={() => handleSelect(makanan)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{makanan.nama}</h3>
                    <p className="text-sm text-gray-500">{makanan.kode}</p>
                  </div>
                  <FiAlertTriangle className={`text-gray-400 transition-transform ${selectedMakanan?.id === makanan.id ? 'rotate-180' : ''}`} />
                </div>
                {makanan.deskripsi && (
                  <p className="text-sm text-gray-600 mt-2">{makanan.deskripsi}</p>
                )}
              </button>

              {selectedMakanan?.id === makanan.id && makananZat[makanan.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                  <h4 className="font-medium text-gray-700 mb-3">Zat Kimia Terkait:</h4>
                  <div className="flex flex-wrap gap-2">
                    {makananZat[makanan.id].map((zat) => (
                      <span key={zat.id} className="badge-berbahaya text-sm px-3 py-1">
                        {zat.nama} ({zat.kode})
                      </span>
                    ))}
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

export default MakananList
