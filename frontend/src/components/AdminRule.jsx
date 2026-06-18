import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Pagination from './Pagination'
import { asArray } from '../utils/array'
import {
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default function AdminRule() {
  const { isSuperadmin, isEditor } = useAuth()
  const [data, setData] = useState([])
  const [makananList, setMakananList] = useState([])
  const [zatList, setZatList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [form, setForm] = useState({
    kode: '',
    makanan_id: '',
    kesimpulan: 'Berbahaya',
    antecedents: [{ zat_id: '', operator: 'OR' }],
  })

  useEffect(() => {
    Promise.all([fetchRules(), fetchMakanan(), fetchZat()])
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${API_URL}/rules`)
      setData(asArray(res.data))
    } catch (error) {
      toast.error('Gagal memuat data aturan')
    } finally {
      setLoading(false)
    }
  }

  const fetchMakanan = async () => {
    try {
      const res = await axios.get(`${API_URL}/makanan`)
      setMakananList(asArray(res.data))
    } catch (error) {
      console.error('Gagal memuat makanan:', error)
    }
  }

  const fetchZat = async () => {
    try {
      const res = await axios.get(`${API_URL}/zat`)
      setZatList(asArray(res.data))
    } catch (error) {
      console.error('Gagal memuat zat:', error)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setForm({
      kode: '',
      makanan_id: '',
      kesimpulan: 'Berbahaya',
      antecedents: [{ zat_id: '', operator: 'OR' }],
    })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
      const itemAntecedents = asArray(item.antecedents)
      setForm({
        kode: item.kode,
        makanan_id: item.makanan_id,
        kesimpulan: item.kesimpulan,
        antecedents: itemAntecedents.length > 0
          ? itemAntecedents.map((a) => ({
              zat_id: a.zat_id,
              operator: a.operator,
            }))
          : [{ zat_id: '', operator: 'OR' }],
      })
    setShowModal(true)
  }

  const addAntecedent = () => {
    setForm({
      ...form,
      antecedents: [...form.antecedents, { zat_id: '', operator: 'OR' }],
    })
  }

  const removeAntecedent = (index) => {
    if (form.antecedents.length <= 1) return
    const updated = form.antecedents.filter((_, i) => i !== index)
    setForm({ ...form, antecedents: updated })
  }

  const updateAntecedent = (index, field, value) => {
    const updated = [...form.antecedents]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, antecedents: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    // Validate antecedents
    const validAntecedents = asArray(form.antecedents).filter((a) => a.zat_id !== '')
    if (validAntecedents.length === 0) {
      toast.error('Minimal satu zat kimia harus dipilih')
      return
    }

    const payload = {
      kode: form.kode,
      makanan_id: parseInt(form.makanan_id),
      kesimpulan: form.kesimpulan,
      antecedents: validAntecedents.map((a) => ({
        zat_id: parseInt(a.zat_id),
        operator: a.operator,
      })),
    }

    try {
      if (editingItem) {
        await axios.put(`${API_URL}/rules/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Aturan berhasil diperbarui')
      } else {
        await axios.post(`${API_URL}/rules`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Aturan berhasil ditambahkan')
      }
      setShowModal(false)
      fetchRules()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Gagal menyimpan data'
      toast.error(msg)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus aturan "${item.kode}"?`)) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${API_URL}/rules/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Aturan berhasil dihapus')
      fetchRules()
    } catch (error) {
      toast.error('Gagal menghapus aturan')
    }
  }

  const handleTestRule = async (item) => {
    const token = localStorage.getItem('token')
    const zatIds = asArray(item.antecedents).map((a) => a.zat_id)
    try {
      const res = await axios.post(
        `${API_URL}/rules/${item.id}/test`,
        { zat_ids: zatIds },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const result = res.data
      if (result.terpenuhi) {
        toast.success(`Rule terpenuhi! Kesimpulan: ${result.kesimpulan}`)
      } else {
        toast.error('Rule tidak terpenuhi')
      }
    } catch (error) {
      toast.error('Gagal menguji aturan')
    }
  }

  const safeData = asArray(data)
  const filtered = safeData.filter(
    (item) =>
      item.kode.toLowerCase().includes(search.toLowerCase()) ||
      (item.makanan_nama &&
        item.makanan_nama.toLowerCase().includes(search.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-800">Kelola Aturan</h1>
          <p className="text-gray-500 mt-1">
            Manajemen aturan Forward Chaining untuk deteksi zat berbahaya
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Tambah Aturan
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari aturan..."
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
                  Makanan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Antecedents (Zat)
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kesimpulan
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
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
                    colSpan={isEditor ? 6 : 5}
                    className="text-center py-8 text-gray-400"
                  >
                    Tidak ada data aturan
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="badge badge-primary">{item.kode}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.makanan_nama || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {asArray(item.antecedents).map((ant, idx, arr) => (
                          <span
                            key={ant.id || idx}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                          >
                            {ant.zat_nama || `Zat #${ant.zat_id}`}
                            {idx < arr.length - 1 && (
                              <span className="text-yellow-600 font-semibold ml-1">
                                {ant.operator}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          item.kesimpulan === 'Berbahaya'
                            ? 'badge-danger'
                            : 'badge-success'
                        }`}
                      >
                        {item.kesimpulan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          item.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.is_active ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {isEditor && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTestRule(item)}
                            className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                            title="Uji Rule"
                          >
                            <HiOutlineLightningBolt className="w-4 h-4" />
                          </button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? 'Edit Aturan' : 'Tambah Aturan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Aturan
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingItem}
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value })}
                    className="input-field disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="Contoh: R001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Makanan
                  </label>
                  <select
                    required
                    value={form.makanan_id}
                    onChange={(e) =>
                      setForm({ ...form, makanan_id: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Pilih Makanan</option>
                    {makananList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.kode} - {m.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kesimpulan
                </label>
                <select
                  value={form.kesimpulan}
                  onChange={(e) =>
                    setForm({ ...form, kesimpulan: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="Berbahaya">Berbahaya</option>
                  <option value="Aman">Aman</option>
                </select>
              </div>

              {/* Antecedents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Antecedents (Kondisi)
                  </label>
                  <button
                    type="button"
                    onClick={addAntecedent}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Tambah Kondisi
                  </button>
                </div>
                <div className="space-y-3">
                    {asArray(form.antecedents).map((ant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <select
                          required
                          value={ant.zat_id}
                          onChange={(e) =>
                            updateAntecedent(index, 'zat_id', e.target.value)
                          }
                          className="input-field text-sm"
                        >
                          <option value="">Pilih Zat Kimia</option>
                          {zatList.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.kode} - {z.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                      {index < form.antecedents.length - 1 && (
                        <div className="w-20">
                          <select
                            value={ant.operator}
                            onChange={(e) =>
                              updateAntecedent(index, 'operator', e.target.value)
                            }
                            className="input-field text-sm"
                          >
                            <option value="OR">OR</option>
                            <option value="AND">AND</option>
                          </select>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAntecedent(index)}
                        disabled={form.antecedents.length <= 1}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Aturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
