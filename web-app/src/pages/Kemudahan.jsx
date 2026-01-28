import React, { useEffect, useState } from 'react'

const facilityDefaults = {
  title: 'Kemudahan',
  subtitle: 'Kad tempahan & fasiliti.',
  cards: [
    { tag: 'Rekreasi', title: 'Kolam Renang Infinit', summary: 'Ketenangan air yang menyegarkan dengan sistem penapisan kristal; pemandangan panorama.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...mr4', meta: '7:00 pagi - 10:00 malam', badge: 'Popular', icon: 'pool' },
    { tag: 'Keluarga', title: 'Taman Permainan', summary: 'Permukaan lembut EPDM dan peralatan moden untuk si kecil bermain selamat.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...SMTQjjOiGD6HYw', meta: '8:00 pagi - 8:00 malam', icon: 'child_care' },
    { tag: 'Kesihatan', title: 'Laman Refleksologi', summary: 'Zon herba aromatik untuk terapi minda & fizikal; sesuai meditasi.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...PNSHPZEg77', meta: 'Sentiasa terbuka', icon: 'spa' },
    { tag: 'Komuniti', title: 'Dewan Serbaguna', summary: 'Ruang berhawa dingin untuk kenduri, mesyuarat dan acara komuniti.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...v_pdboFOzIg', meta: 'Perlu tempahan', icon: 'groups' },
    { tag: 'Sukan', title: 'Gimnasium Terbuka', summary: 'Peralatan senaman luaran diselenggara rapi di tengah kehijauan.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...0', meta: '6:00 pagi - 11:00 malam', icon: 'fitness_center' },
    { tag: 'Santai', title: 'Kawasan BBQ', summary: 'Kemudahan memanggang lengkap berhampiran kolam; sesuai untuk keluarga.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXr...okE', meta: 'Tempahan diperlukan', icon: 'outdoor_grill' },
  ],
}

export default function Kemudahan(){
  const [cards, setCards] = useState([])

  useEffect(()=>{
    const storageKey = 'pageDataV1'
    const pageKey = 'kemudahan'
    const saved = localStorage.getItem(storageKey)
    if (!saved) {
      const seeded = { [pageKey]: { ...facilityDefaults, cards: facilityDefaults.cards.map(c => ({ id: crypto.randomUUID(), ...c })) } }
      localStorage.setItem(storageKey, JSON.stringify(seeded))
      setCards(seeded[pageKey].cards)
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (!parsed[pageKey] || !Array.isArray(parsed[pageKey].cards)) {
        const seeded = { ...parsed, ...{ [pageKey]: { ...facilityDefaults, cards: facilityDefaults.cards.map(c => ({ id: crypto.randomUUID(), ...c })) } } }
        localStorage.setItem(storageKey, JSON.stringify(seeded))
        setCards(seeded[pageKey].cards)
        return
      }
      setCards(parsed[pageKey].cards.map(c => ({ id: c.id || crypto.randomUUID(), ...c })))
    } catch (e) {
      const seeded = { [pageKey]: { ...facilityDefaults, cards: facilityDefaults.cards.map(c => ({ id: crypto.randomUUID(), ...c })) } }
      localStorage.setItem(storageKey, JSON.stringify(seeded))
      setCards(seeded[pageKey].cards)
    }
  }, [])

  return (
    <div>
      <div className="bg-primary/5 py-2 px-4 text-center border-b border-primary/10">
        <p className="text-xs md:text-sm font-medium text-primary flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          <span>Notis: Penjagaan taman tahunan dijalankan hujung minggu ini.</span>
        </p>
      </div>

      <header className="sticky top-0 z-50 bg-[#e8f0ed]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl"><span className="material-symbols-outlined block">yard</span></div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight text-primary">Banjaria<span className="font-light text-text-main ml-1">Court</span></h1>
              <p className="text-[0.65rem] font-medium tracking-widest uppercase text-text-main/50">Urban Sanctuary</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 lg:px-20 py-12 text-center">
          <div className="facility-hero rounded-3xl border border-primary/10 shadow-lg px-6 lg:px-12 py-12 lg:py-16 overflow-hidden relative">
            <div className="max-w-[1000px] mx-auto relative z-10">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 inline-flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-primary/10 shadow-sm">Gaya Hidup Zen</span>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#1c2120] dark:text-white">Kemudahan &amp; Ameniti</h1>
              <p className="max-w-2xl mx-auto text-[#60857d] dark:text-[#a0bcba] text-lg md:text-xl font-medium leading-relaxed mt-4">Alami keharmonian alam semula jadi yang diintegrasikan dengan kehidupan bandar moden. Setiap sudut direka untuk kesejahteraan anda.</p>
              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <a className="flex h-12 items-center justify-center rounded-xl bg-white px-8 text-primary text-sm font-bold shadow-lg transition-all hover:bg-opacity-90 hover:scale-105" href="#galeri-fasiliti">Lihat Galeri</a>
                <a className="flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-white text-sm font-bold shadow-lg transition-all hover:bg-opacity-90 hover:scale-105" href="/portal">Tempah Fasiliti</a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-20 lg:px-40 py-4" id="galeri-fasiliti">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#eaf0ef] dark:border-[#3a4d49]">
            <div>
              <h2 className="text-2xl font-bold text-[#111816] dark:text-white">Galeri Fasiliti</h2>
              <p className="text-[#60857d] dark:text-[#a0bcba] text-sm mt-1">Terokai ruang yang tersedia untuk anda</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md transition-all hover:shadow-lg">Semua</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#eaf0ef] dark:bg-[#344646] text-[#111816] dark:text-[#f9fbfa] text-sm font-semibold hover:bg-primary/10 transition-colors">Rekreasi</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#eaf0ef] dark:bg-[#344646] text-[#111816] dark:text-[#f9fbfa] text-sm font-semibold hover:bg-primary/10 transition-colors">Keluarga</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#eaf0ef] dark:bg-[#344646] text-[#111816] dark:text-[#f9fbfa] text-sm font-semibold hover:bg-primary/10 transition-colors">Kesihatan</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#eaf0ef] dark:bg-[#344646] text-[#111816] dark:text-[#f9fbfa] text-sm font-semibold hover:bg-primary/10 transition-colors">Sukan</button>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-20 lg:px-40 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {cards.map(card => (
              <article key={card.id} className="group">
                <div className="relative overflow-hidden rounded-[2rem] aspect-[16/10] shadow-md mb-6">
                  <div className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${card.image}')` }} />
                  {card.badge && (
                    <div className="absolute top-5 right-5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span> {card.badge}
                    </div>
                  )}
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[#111816] dark:text-[#f9fbfa] text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{card.title}</h4>
                    <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-lg">{card.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wide">{card.tag}</span>
                    </div>
                  </div>
                  <p className="text-[#60857d] dark:text-[#a0bcba] text-base leading-relaxed mb-4 line-clamp-2">{card.summary}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#eaf0ef] dark:border-[#3a4d49]">
                    <div className="flex items-center gap-2 text-[#111816] dark:text-[#f9fbfa]">
                      <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                      <span className="text-sm font-bold">{card.meta}</span>
                    </div>
                    <span className="text-primary text-sm font-bold flex items-center gap-1">Lihat Butiran <span className="material-symbols-outlined text-lg">arrow_forward</span></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-20 lg:px-40 pb-20">
          <div className="garden-gradient rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center justify-center size-10 rounded-full bg-white/20 text-white">
                  <span className="material-symbols-outlined">calendar_month</span>
                </span>
                <h2 className="text-white text-3xl md:text-4xl font-black leading-tight">Mahu Gunakan Fasiliti?</h2>
              </div>
              <p className="text-white/80 text-lg mb-8 max-w-xl font-medium leading-relaxed">Tempahan boleh dilakukan secara atas talian dengan mudah. Pastikan anda menyemak ketersediaan tarikh terlebih dahulu.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="h-14 px-8 rounded-2xl bg-white text-primary text-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">Buat Tempahan Sekarang</button>
                <button className="h-14 px-8 rounded-2xl bg-black/20 text-white text-lg font-bold backdrop-blur-sm border border-white/10 transition-transform hover:bg-black/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">Semak Jadual</button>
              </div>
            </div>
            <div className="w-full md:w-auto relative z-10 hidden md:block">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg max-w-xs">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-white text-2xl">notifications_active</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Status Fasiliti</p>
                    <p className="text-white/60 text-xs">Kemas kini langsung</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Kolam Renang</span>
                    <span className="text-[#aefce4] font-bold flex items-center gap-1"><span className="size-2 rounded-full bg-[#aefce4]"></span> Dibuka</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Gimnasium</span>
                    <span className="text-[#aefce4] font-bold flex items-center gap-1"><span className="size-2 rounded-full bg-[#aefce4]"></span> Dibuka</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Dewan</span>
                    <span className="text-[#fcaeAe] font-bold flex items-center gap-1"><span className="size-2 rounded-full bg-[#fcaeae]"></span> Penuh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-stone-200 pt-16 pb-10 px-4 lg:px-8"> ... </footer>

    </div>
  )
}
