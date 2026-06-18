import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Pagination from './Pagination'
import {
  HiOutlineBeaker,
  HiOutlineCube,
  HiOutlineScale,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineUser,
} from 'react-icons/hi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const bulanNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dashboard/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setStats(statsRes.data)
      setLogs(logsRes.data)
    } catch (error) {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const chartData = stats?.konsultasi_per_bulan?.map((item) => ({
    name: bulanNames[item.bulan - 1] || `Bulan ${item.bulan}`,
    jumlah: item.jumlah,
  })) || []

  const totalPages = Math.ceil(logs.length / pageSize)
  const paginatedLogs = logs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang, <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineBeaker}
          label="Total Zat Kimia"
          value={stats?.total_zat || 0}
          color="bg-red-500"
        />
        <StatCard
          icon={HiOutlineCube}
          label="Total Makanan"
          value={stats?.total_makanan || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={HiOutlineScale}
          label="Total Aturan"
          value={stats?.total_aturan || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={HiOutlineClipboardCheck}
          label="Total Konsultasi"
          value={stats?.total_konsultasi || 0}
          color="bg-purple-500"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Konsultasi per Bulan (Tahun Ini)
        </h2>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Belum ada data konsultasi
            </div>
          )}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="space-y-3">
          {paginatedLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Belum ada aktivitas</p>
          ) : (
            paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                  <HiOutlineClock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.detail || log.aksi}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <HiOutlineUser className="w-3 h-3" />
                      {log.username || 'System'}
                    </span>
                    <span>•</span>
                    <span>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
