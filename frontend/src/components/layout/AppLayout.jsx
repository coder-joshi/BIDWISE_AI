import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import GovHeader from './GovHeader'
import GovNavbar from './GovNavbar'

export default function AppLayout() {
  const [darkMode, setDarkMode] = useState(false) // Default to light mode for GOI theme

  useEffect(() => {
    // Enforce light mode for gov theme
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-body flex flex-col">
      {/* Official Government Header */}
      <GovHeader />
      
      {/* Official Government Navbar */}
      <GovNavbar />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-transparent">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 min-h-[60vh]">
          <Outlet />
        </div>
      </main>
      
      {/* Official Government Footer (Placeholder) */}
      <footer className="w-full bg-[#002b66] text-white py-6 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-sm flex flex-col md:flex-row justify-between items-center text-gray-300">
          <p>© 2026 Government of India. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Help</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
