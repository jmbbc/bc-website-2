import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Notices from './pages/Notices'

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7fbfa] text-[#0b3b34] p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold">BC Web App</div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm">Home</Link>
            <Link to="/notices" className="text-sm font-bold">Notices</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<div>Welcome — gunakan /notices untuk melihat PoC.</div>} />
          <Route path="/notices" element={<Notices />} />
        </Routes>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-sm text-[#60857d]">© Kawasan Comm. Banjaria</footer>
    </div>
  )
}