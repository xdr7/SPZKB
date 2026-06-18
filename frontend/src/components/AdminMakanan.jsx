import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Pagination from './Pagination'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi'

const API_URL = '/api'

export default function AdminMakanan() {
  const { isSuperadmin, isEditor } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [form, setForm] = useState({
    kode: '',
    nama: '',
    deskripsi: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/makanan`)
      setData(res.data)
    } catch (error) {
      toast.error('Gagal memuat data makanan')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setForm({ kode: 'AUTO', nama: '', deskripsi: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      kode: item.kode,
      nama: item.nama,
      deskripsi: item.deskripsi || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      if (editingItem) {
        await axios.put(
          `${API_URL}/makanan/${editingItem.id}`,
          {
            nama: form.nama,
            deskripsi: form.deskripsi,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success('Makanan berhasil diperbarui')
      } else {
        await axios.post(
          `${API_URL}/makanan`,
          {
            nama: form.nama,
            deskripsi: form.deskripsi,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success('Makanan berhasil ditambahkan')
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Gagal menyimpan data'
      toast.error(msg)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus makanan "${item.nama}"?`)) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${API_URL}/makanan/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Makanan berhasil dihapus')
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus makanan')
    }
  }

  const filtered = data.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.kode.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Makanan</h1>
          <p className="text-gray-500 mt-1">
            Manajemen data jenis makanan olahan
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Tambah Makanan
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari makanan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                {isEditor && (
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEditor ? 4 : 3}
                    className="text-center py-8 text-gray-400"
                  >
                    Tidak ada data makanan
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="badge badge-primary">{item.kode}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                      {item.deskripsi || '-'}
                    </td>
                    {isEditor && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          {isSuperadmin && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? 'Edit Makanan' : 'Tambah Makanan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingItem}
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Otomatis dibuat sistem"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kode makanan dibuat otomatis oleh sistem saat data disimpan.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="input-field"
                  placeholder="Nama makanan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                  className="input-field"
                  placeholder="Deskripsi makanan (opsional)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Makanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
