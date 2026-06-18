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

export default function AdminBatas() {
  const { isSuperadmin, isEditor } = useAuth()
  const [data, setData] = useState([])
  const [zatList, setZatList] = useState([])
  const [makananList, setMakananList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [form, setForm] = useState({
    zat_id: '',
    makanan_id: '',
    nilai_maks: '',
    satuan: 'mg',
  })

  const fetchData = async () => {
    await Promise.all([fetchBatas(), fetchZat(), fetchMakanan()])
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const fetchBatas = async () => {
    try {
      const res = await axios.get(`${API_URL}/batas`)
      setData(res.data)
    } catch (error) {
      toast.error('Gagal memuat data batas maksimum')
    } finally {
      setLoading(false)
    }
  }

  const fetchZat = async () => {
    try {
      const res = await axios.get(`${API_URL}/zat`)
      setZatList(res.data)
    } catch (error) {
      console.error('Gagal memuat zat:', error)
    }
  }

  const fetchMakanan = async () => {
    try {
      const res = await axios.get(`${API_URL}/makanan`)
      setMakananList(res.data)
    } catch (error) {
      console.error('Gagal memuat makanan:', error)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setForm({ zat_id: '', makanan_id: '', nilai_maks: '', satuan: 'mg' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      zat_id: item.zat_id,
      makanan_id: item.makanan_id,
      nilai_maks: item.nilai_maks,
      satuan: item.satuan,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    const payload = {
      zat_id: parseInt(form.zat_id),
      makanan_id: parseInt(form.makanan_id),
      nilai_maks: parseFloat(form.nilai_maks),
      satuan: form.satuan,
    }

    try {
      if (editingItem) {
        await axios.put(`${API_URL}/batas/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Batas maksimum berhasil diperbarui')
      } else {
        await axios.post(`${API_URL}/batas`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Batas maksimum berhasil ditambahkan')
      }
      setShowModal(false)
      fetchBatas()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Gagal menyimpan data'
      toast.error(msg)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus batas maksimum untuk ${item.zat_nama} - ${item.makanan_nama}?`)) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${API_URL}/batas/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Batas maksimum berhasil dihapus')
      fetchBatas()
    } catch (error) {
      toast.error('Gagal menghapus batas maksimum')
    }
  }

  const filtered = data.filter(
    (item) =>
      (item.zat_nama &&
        item.zat_nama.toLowerCase().includes(search.toLowerCase())) ||
      (item.makanan_nama &&
        item.makanan_nama.toLowerCase().includes(search.toLowerCase())) ||
      (item.zat_kode &&
        item.zat_kode.toLowerCase().includes(search.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-800">
            Kelola Batas Maksimum
          </h1>
          <p className="text-gray-500 mt-1">
            Manajemen batas maksimum penggunaan zat kimia pada makanan
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Tambah Batas
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan zat atau makanan..."
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
                  Zat Kimia
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Makanan
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nilai Maksimum
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Satuan
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
                    colSpan={isEditor ? 5 : 4}
                    className="text-center py-8 text-gray-400"
                  >
                    Tidak ada data batas maksimum
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary">
                          {item.zat_kode}
                        </span>
                        <span className="font-medium text-gray-800">
                          {item.zat_nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {item.makanan_nama || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {item.nilai_maks}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-success">{item.satuan}</span>
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
                {editingItem
                  ? 'Edit Batas Maksimum'
                  : 'Tambah Batas Maksimum'}
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
                  Zat Kimia
                </label>
                <select
                  required
                  disabled={!!editingItem}
                  value={form.zat_id}
                  onChange={(e) => setForm({ ...form, zat_id: e.target.value })}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Pilih Zat Kimia</option>
                  {zatList.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.kode} - {z.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Makanan
                </label>
                <select
                  required
                  disabled={!!editingItem}
                  value={form.makanan_id}
                  onChange={(e) =>
                    setForm({ ...form, makanan_id: e.target.value })
                  }
                  className="input-field disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Pilih Makanan</option>
                  {makananList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.kode} - {m.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Maksimum
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={form.nilai_maks}
                    onChange={(e) =>
                      setForm({ ...form, nilai_maks: e.target.value })
                    }
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <select
                    value={form.satuan}
                    onChange={(e) =>
                      setForm({ ...form, satuan: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="mg">mg</option>
                    <option value="mg/kg">mg/kg</option>
                    <option value="mg/L">mg/L</option>
                    <option value="ppm">ppm</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Batas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
