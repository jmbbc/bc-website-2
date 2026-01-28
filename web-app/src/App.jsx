import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Notices from './pages/Notices'
import Portal from './pages/Portal'
import Tender from './pages/Tender'
import Kemudahan from './pages/Kemudahan'

import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-text-main p-6 font-display">
      <header className="max-w-6xl mx-auto mb-6">
        {/* top nav remains inside pages, keep header area small here */}
      </header>

      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/tender" element={<Tender />} />
          <Route path="/kemudahan" element={<Kemudahan />} />
        </Routes>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-sm text-text-main/60">© Kawasan Comm. Banjaria</footer>
    </div>
  )
}