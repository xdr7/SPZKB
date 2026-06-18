import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiShield, FiArrowLeft, FiArrowRight, FiCheck, FiAlertTriangle, FiDownload, FiRefreshCw } from 'react-icons/fi'

const API_URL = '/api'

function KonsultasiWizard() {
  const [step, setStep] = useState(1)
  const [makananList, setMakananList] = useState([])
  const [zatList, setZatList] = useState([])
  const [selectedMakanan, setSelectedMakanan] = useState(null)
  const [selectedZatIds, setSelectedZatIds] = useState([])
  const [kadar, setKadar] = useState('')
  const [satuan, setSatuan] = useState('mg')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [consultationId, setConsultationId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [makananRes, zatRes] = await Promise.all([
        axios.get(`${API_URL}/makanan`),
        axios.get(`${API_URL}/zat`),
      ])
      setMakananList(makananRes.data)
      setZatList(zatRes.data)
    } catch (error) {
      toast.error('Gagal memuat data')
    }
  }

  const handleMakananSelect = (makanan) => {
    setSelectedMakanan(makanan)
    setSelectedZatIds([])
    setStep(2)
  }

  const toggleZat = (zatId) => {
    setSelectedZatIds((prev) =>
      prev.includes(zatId) ? prev.filter((id) => id !== zatId) : [...prev, zatId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedMakanan || selectedZatIds.length === 0 || !kadar) {
      toast.error('Lengkapi semua data terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/konsultasi`, {
        makanan_id: selectedMakanan.id,
        zat_ids: selectedZatIds,
        kadar: parseFloat(kadar),
        satuan: satuan,
      })
      setResult(response.data)
      setConsultationId(response.data[0]?.id || null)
      setStep(3)
      toast.success('Konsultasi selesai!')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal melakukan konsultasi')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedMakanan(null)
    setSelectedZatIds([])
    setKadar('')
    setSatuan('mg')
    setResult(null)
    setConsultationId(null)
  }

  const downloadPdf = async () => {
    if (!consultationId) {
      toast.error('ID konsultasi tidak tersedia')
      return
    }
    try {
      const response = await axios.get(`${API_URL}/konsultasi/${consultationId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `konsultasi-${consultationId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF berhasil diunduh')
    } catch (error) {
      toast.error('Gagal mengunduh PDF')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Nav */}
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
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <FiCheck /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 sm:w-24 h-1 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 sm:gap-24 text-sm text-gray-500 mb-8">
          <span className={step >= 1 ? 'text-primary-600 font-medium' : ''}>Pilih Makanan</span>
          <span className={step >= 2 ? 'text-primary-600 font-medium' : ''}>Pilih Zat & Kadar</span>
          <span className={step >= 3 ? 'text-primary-600 font-medium' : ''}>Hasil</span>
        </div>

        {/* Step 1: Pilih Makanan */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Jenis Makanan</h2>
            <p className="text-gray-600 mb-6">Pilih makanan yang ingin Anda periksa kandungan zat kimianya.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {makananList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMakananSelect(m)}
                  className={`card text-left hover:shadow-md transition-all ${
                    selectedMakanan?.id === m.id
                      ? 'ring-2 ring-primary-500 border-primary-500'
                      : ''
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{m.nama}</h3>
                  <p className="text-sm text-gray-500 mt-1">{m.kode}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.deskripsi}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pilih Zat & Kadar */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <button onClick={() => setStep(1)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-4">
                <FiArrowLeft /> Ganti Makanan
              </button>
              <div className="card">
                <h3 className="font-semibold text-gray-900">Makanan: {selectedMakanan?.nama}</h3>
                <p className="text-sm text-gray-500">{selectedMakanan?.kode}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Zat Kimia</h2>
            <p className="text-gray-600 mb-6">Pilih zat kimia yang terdeteksi atau dicurigai ada dalam makanan.</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {zatList.map((zat) => (
                <button
                  key={zat.id}
                  onClick={() => toggleZat(zat.id)}
                  className={`card text-left hover:shadow-md transition-all ${
                    selectedZatIds.includes(zat.id)
                      ? 'ring-2 ring-danger-500 border-danger-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                        selectedZatIds.includes(zat.id)
                          ? 'bg-danger-500 border-danger-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedZatIds.includes(zat.id) && <FiCheck className="text-white w-3 h-3" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{zat.nama}</h3>
                      <p className="text-sm text-gray-500">{zat.kode}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Masukkan Kadar</h2>
            <p className="text-gray-600 mb-4">Masukkan kadar zat kimia yang terdeteksi (jika ada).</p>

            <div className="card">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="label">Kadar</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kadar}
                    onChange={(e) => setKadar(e.target.value)}
                    placeholder="Contoh: 0.5"
                    className="input-field"
                  />
                </div>
                <div className="w-32">
                  <label className="label">Satuan</label>
                  <select value={satuan} onChange={(e) => setSatuan(e.target.value)} className="select-field">
                    <option value="mg">mg</option>
                    <option value="gram">gram</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || selectedZatIds.length === 0 || !kadar}
                className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    Lihat Hasil
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hasil */}
        {step === 3 && result && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasil Konsultasi</h2>
              <p className="text-gray-600">
                Makanan: <strong>{selectedMakanan?.nama}</strong>
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {result.map((item, idx) => (
                <div
                  key={idx}
                  className={`card border-l-4 ${
                    item.hasil === 'AMAN' ? 'border-l-success-500' : 'border-l-danger-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.zat_nama}</h3>
                      <p className="text-sm text-gray-500">{item.zat_kode}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.hasil === 'AMAN'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}
                    >
                      {item.hasil === 'AMAN' ? '✓ AMAN' : '✗ BERBAHAYA'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kadar:</span>
                      <p className="font-medium">{item.kadar} {item.satuan}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Batas Maks:</span>
                      <p className="font-medium">
                        {item.batas_maks !== null ? `${item.batas_maks} ${item.batas_satuan || item.satuan}` : 'Tidak ada'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Persentase:</span>
                      <p className="font-medium">
                        {item.persentase !== null ? `${item.persentase.toFixed(1)}%` : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Aturan Terpenuhi:</span>
                      <p className="font-medium">{item.rules_terpenuhi?.join(', ') || '-'}</p>
                    </div>
                  </div>

                  {item.hasil === 'BERBAHAYA' && (
                    <div className="mt-4 p-4 bg-danger-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FiAlertTriangle className="text-danger-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-danger-800">Efek Kesehatan:</p>
                          <p className="text-sm text-danger-700 mt-1">{item.efek_kesehatan}</p>
                          <p className="font-medium text-danger-800 mt-2">Solusi:</p>
                          <p className="text-sm text-danger-700 mt-1">{item.solusi}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={downloadPdf} className="btn-primary inline-flex items-center gap-2">
                <FiDownload /> Download PDF
              </button>
              <button onClick={resetForm} className="btn-secondary inline-flex items-center gap-2">
                <FiRefreshCw /> Konsultasi Lagi
              </button>
              <Link to="/" className="btn-secondary inline-flex items-center gap-2">
                <FiArrowLeft /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default KonsultasiWizard
