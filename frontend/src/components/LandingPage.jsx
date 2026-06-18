import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiSearch, FiBookOpen, FiUsers, FiArrowRight, FiAlertTriangle, FiCheckCircle, FiInfo, FiMessageSquare } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useBranding } from '../context/BrandingContext'

function LandingPage() {
  const { branding } = useBranding()
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ nama: '', email: '', komentar: '' })
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await axios.get('/api/komentar')
      setComments(response.data)
    } catch (error) {
      setComments([])
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (!commentForm.nama || !commentForm.komentar) {
      toast.error('Nama dan komentar harus diisi')
      return
    }

    setCommentLoading(true)
    try {
      await axios.post('/api/komentar', commentForm)
      toast.success('Terima kasih, komentar Anda berhasil dikirim')
      setCommentForm({ nama: '', email: '', komentar: '' })
      fetchComments()
    } catch (error) {
      toast.error('Gagal mengirim komentar')
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt={branding.app_name} className="h-8 w-8 object-contain" />
              ) : (
                <FiShield className="h-8 w-8 text-primary-600" />
              )}
              <span className="text-xl font-bold text-gray-900">{branding.app_name || 'SPZKB'}</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-primary-600 font-medium">Beranda</Link>
              <Link to="/konsultasi" className="text-gray-600 hover:text-primary-600 transition-colors">Konsultasi</Link>
              <Link to="/zat" className="text-gray-600 hover:text-primary-600 transition-colors">Zat Kimia</Link>
              <Link to="/makanan" className="text-gray-600 hover:text-primary-600 transition-colors">Makanan</Link>
              <Link to="/tentang" className="text-gray-600 hover:text-primary-600 transition-colors">Tentang</Link>
              <Link to="/admin/login" className="btn-primary text-sm">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistem Pakar{' '}
            <span className="text-primary-600">{branding.app_name || 'Zat Kimia'}</span>
            <br />pada Makanan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Deteksi bahaya zat kimia berbahaya pada makanan menggunakan metode 
            <strong> Forward Chaining</strong>. Ketahui apakah makanan Anda aman dikonsumsi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/konsultasi" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
              Mulai Konsultasi
              <FiArrowRight />
            </Link>
            <Link to="/tentang" className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
              Pelajari Lebih Lanjut
              <FiInfo />
            </Link>
          </div>
        </div>
      </section>

      {/* Tugas Akhir Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <FiInfo className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Tugas Akhir</h2>
              <p className="text-gray-700 leading-relaxed">
                Aplikasi Sistem Pakar Penggunaan Zat Kimia pada Makanan ini merupakan bagian dari Tugas Akhir
                <strong> Asmaul Asni Subegi, S.Kom.</strong>, lulusan Fakultas Matematika dan Ilmu Pengetahuan Alam
                Tahun 2011. Sistem ini dirancang untuk membantu mendeteksi potensi bahaya zat kimia pada makanan
                menggunakan metode Forward Chaining.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: FiAlertTriangle, label: 'Zat Kimia Berbahaya', value: '4', color: 'text-danger-600', bg: 'bg-danger-50' },
            { icon: FiSearch, label: 'Jenis Makanan', value: '7', color: 'text-primary-600', bg: 'bg-primary-50' },
            { icon: FiBookOpen, label: 'Aturan Pakar', value: '7', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: FiCheckCircle, label: 'Metode Inferensi', value: 'Forward Chaining', color: 'text-success-600', bg: 'bg-success-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-xl p-6 text-center`}>
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Bagaimana Cara Kerjanya?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Pilih Makanan',
                desc: 'Pilih jenis makanan yang ingin Anda periksa dari daftar makanan yang tersedia.',
                color: 'bg-primary-100 text-primary-600',
              },
              {
                step: '2',
                title: 'Pilih Zat Kimia',
                desc: 'Pilih zat kimia yang terdeteksi atau dicurigai ada dalam makanan tersebut.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                step: '3',
                title: 'Dapatkan Hasil',
                desc: 'Sistem akan menganalisis menggunakan Forward Chaining dan memberikan hasil AMAN atau BERBAHAYA.',
                color: 'bg-success-100 text-success-600',
              },
            ].map((feature, idx) => (
              <div key={idx} className="card text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center text-xl font-bold mx-auto mb-4`}>
                  {feature.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zat Kimia Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Zat Kimia Berbahaya</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Empat jenis zat kimia yang perlu diwaspadai penggunaannya dalam makanan berdasarkan PerBPOM No. 11/2019
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { nama: 'Kalsium Benzoat', kode: 'Z001', desc: 'Pengawet antimikroba untuk saus, minuman, dan olahan', color: 'border-blue-400', icon: '🧪' },
              { nama: 'Kalium Nitrit', kode: 'Z002', desc: 'Pengawet daging olahan dan pengikat warna', color: 'border-red-400', icon: '🥩' },
              { nama: 'Kalsium Propionat', kode: 'Z003', desc: 'Pengawet antikapang untuk roti dan bakery', color: 'border-amber-400', icon: '🍞' },
              { nama: 'Natrium Metasulfat', kode: 'Z004', desc: 'Pengawet, antioksidan, dan pemutih makanan', color: 'border-green-400', icon: '⚗️' },
            ].map((zat, idx) => (
              <div key={idx} className={`card border-t-4 ${zat.color} hover:shadow-md transition-shadow`}>
                <div className="text-4xl mb-3">{zat.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{zat.nama}</h3>
                <p className="text-sm text-gray-500 mb-2">{zat.kode}</p>
                <p className="text-gray-600 text-sm">{zat.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/zat" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
              Lihat Detail Zat Kimia <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Komentar Pengunjung */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <FiMessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Komentar Pengunjung</h2>
                <p className="text-sm text-gray-500">Berikan saran, kritik, atau pesan untuk pengembangan sistem.</p>
              </div>
            </div>
            <form onSubmit={submitComment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={commentForm.nama}
                  onChange={(e) => setCommentForm({ ...commentForm, nama: e.target.value })}
                  className="input-field"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                  className="input-field"
                  placeholder="Email Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
                <textarea
                  rows={4}
                  value={commentForm.komentar}
                  onChange={(e) => setCommentForm({ ...commentForm, komentar: e.target.value })}
                  className="input-field"
                  placeholder="Tulis komentar Anda..."
                />
              </div>
              <button type="submit" disabled={commentLoading} className="btn-primary w-full">
                {commentLoading ? 'Mengirim...' : 'Kirim Komentar'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Komentar Terbaru</h3>
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Belum ada komentar pengunjung.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900">{comment.nama}</p>
                      <p className="text-xs text-gray-400">
                        {comment.created_at ? new Date(comment.created_at).toLocaleString('id-ID') : '-'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{comment.email || 'Email tidak ditampilkan'}</p>
                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">{comment.komentar}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap untuk Memeriksa Makanan Anda?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Gunakan sistem pakar kami untuk mendeteksi apakah makanan yang Anda konsumsi 
            mengandung zat kimia berbahaya.
          </p>
          <Link to="/konsultasi" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
            Mulai Konsultasi Sekarang
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 {branding.app_name || 'SPZKB'} - {branding.app_title || 'Sistem Pakar Zat Kimia pada Makanan'}</p>
          <p className="text-sm mt-2">Dibangun dengan metode Forward Chaining untuk deteksi zat kimia berbahaya</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
