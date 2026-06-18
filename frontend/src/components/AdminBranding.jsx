import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useBranding } from '../context/BrandingContext'

export default function AdminBranding() {
  const { branding, updateBranding } = useBranding()
  const [form, setForm] = useState({
    app_name: branding.app_name,
    app_title: branding.app_title,
    logo_url: branding.logo_url || '',
    favicon_url: branding.favicon_url || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await updateBranding(form)
      toast.success('Branding aplikasi berhasil diperbarui')
    } catch (error) {
      toast.error('Gagal memperbarui branding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Branding Aplikasi</h1>
        <p className="text-gray-500 mt-1">Ubah nama aplikasi, logo, dan favicon yang ditampilkan di sistem.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label>
            <input
              type="text"
              value={form.app_name}
              onChange={(e) => setForm({ ...form, app_name: e.target.value })}
              className="input-field"
              placeholder="SPZKB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Aplikasi</label>
            <input
              type="text"
              value={form.app_title}
              onChange={(e) => setForm({ ...form, app_title: e.target.value })}
              className="input-field"
              placeholder="Sistem Pakar Zat Kimia pada Makanan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              className="input-field"
              placeholder="https://contoh.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan ikon default.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Favicon</label>
            <input
              type="url"
              value={form.favicon_url}
              onChange={(e) => setForm({ ...form, favicon_url: e.target.value })}
              className="input-field"
              placeholder="https://contoh.com/favicon.ico"
            />
            <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan favicon default Vite.</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Menyimpan...' : 'Simpan Branding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
