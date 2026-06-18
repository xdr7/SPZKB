import React from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiArrowLeft, FiCpu, FiBook, FiUsers, FiLayers } from 'react-icons/fi'

function TentangSistem() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tentang Sistem</h1>
        <p className="text-gray-600 mb-8">
          Informasi lengkap tentang Sistem Pakar Penggunaan Zat Kimia pada Makanan.
        </p>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <FiCpu className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Apa itu SPZKB?</h2>
                <p className="text-gray-700 leading-relaxed">
                  SPZKB (Sistem Pakar Penggunaan Zat Kimia pada Makanan) adalah sistem berbasis 
                  pengetahuan yang dirancang untuk membantu masyarakat mendeteksi apakah makanan 
                  yang mereka konsumsi mengandung zat kimia berbahaya. Sistem ini menggunakan 
                  metode <strong>Forward Chaining</strong> untuk melakukan inferensi berdasarkan 
                  aturan-aturan yang telah ditetapkan oleh pakar.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FiLayers className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Metode Forward Chaining</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Forward Chaining adalah metode penalaran yang dimulai dari fakta-fakta yang 
                  diketahui (data) menuju kesimpulan. Dalam konteks sistem ini:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Pengguna memilih jenis makanan yang akan diperiksa</li>
                  <li>Pengguna memilih zat kimia yang terdeteksi atau dicurigai</li>
                  <li>Sistem mencari aturan (rule) yang sesuai dengan makanan tersebut</li>
                  <li>Sistem memeriksa apakah zat kimia yang dipilih memenuhi antecedents aturan</li>
                  <li>Jika antecedents terpenuhi, kesimpulan aturan (BERBAHAYA) diaktifkan</li>
                  <li>Sistem juga membandingkan kadar dengan batas maksimum yang diizinkan</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <FiBook className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Basis Pengetahuan</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Sistem ini memiliki basis pengetahuan yang mencakup data yang telah divalidasi 
                  berdasarkan <strong>PerBPOM No. 11 Tahun 2019</strong> tentang Bahan Tambahan Pangan:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Zat Kimia (4)</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>Z001 - Kalsium Benzoat</li>
                      <li>Z002 - Kalium Nitrit</li>
                      <li>Z003 - Kalsium Propionat</li>
                      <li>Z004 - Natrium Metasulfat</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Makanan (7)</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>M001 - Saus Tomat</li>
                      <li>M002 - Minuman Ringan Berkarbonasi</li>
                      <li>M003 - Selai dan Jeli</li>
                      <li>M004 - Aneka Olahan Ikan</li>
                      <li>M005 - Jajanan Anak (Ciki/Makaron)</li>
                      <li>M006 - Tahu</li>
                      <li>M007 - Mie Basah</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Pengguna yang Ditargetkan</h2>
                <p className="text-gray-700 leading-relaxed">
                  Sistem ini ditujukan untuk masyarakat umum yang ingin mengetahui keamanan 
                  makanan yang mereka konsumsi, akademisi yang mempelajari sistem pakar, 
                  serta pihak BPOM atau instansi terkait dalam melakukan pengawasan makanan.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Teknologi yang Digunakan</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Backend</h3>
                <p className="text-sm text-gray-700">Python FastAPI, SQLAlchemy, SQLite</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Frontend</h3>
                <p className="text-sm text-gray-700">React, Vite, Tailwind CSS</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Inferensi</h3>
                <p className="text-sm text-gray-700">Forward Chaining</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Laporan</h3>
                <p className="text-sm text-gray-700">PDF (ReportLab), Excel (openpyxl)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TentangSistem
