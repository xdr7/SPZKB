import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShield, FiHome, FiAlertTriangle, FiCoffee, FiBook, FiBarChart2, FiLogOut, FiMenu, FiX, FiUsers } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useBranding } from '../context/BrandingContext'

function AdminLayout() {
  const { user, logout, isSuperadmin } = useAuth()
  const { branding } = useBranding()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/zat', icon: FiAlertTriangle, label: 'Zat Kimia' },
    { path: '/admin/makanan', icon: FiCoffee, label: 'Makanan' },
    { path: '/admin/rule', icon: FiBook, label: 'Aturan' },
    { path: '/admin/batas', icon: FiBarChart2, label: 'Batas Maksimum' },
    { path: '/admin/branding', icon: FiShield, label: 'Branding' },
  ]

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link to="/admin" className="flex items-center space-x-2">
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt={branding.app_name} className="h-8 w-8 object-contain" />
                ) : (
                  <FiShield className="h-7 w-7 text-primary-600" />
                )}
                <span className="text-lg font-bold text-gray-900">{branding.app_name || 'SPZKB'} Admin</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3 px-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
            >
              <FiLogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
              <FiMenu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt={branding.app_name} className="h-6 w-6 object-contain" />
              ) : (
                <FiShield className="h-6 w-6 text-primary-600" />
              )}
              <span className="font-bold text-gray-900">{branding.app_name || 'SPZKB'}</span>
            </Link>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
