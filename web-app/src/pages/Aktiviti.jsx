import React, { useEffect, useState } from 'react'

const fallbackImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB0yW6o4DoAYcV7ml0A9UJXNP-zefOlqCSX2kjIvA06KHD4P_Ov6MT334kSkkk7UcKkQC3j8_LyRu4cvJdtqYkujTNYFkvl3BX6fXzxhR9dCtBv6HxjJjBnnIwB35Zny3osneBqBlvTNhf7MQYvXgXIoPjzDj3rBuvvv8Ge8--NRRej3AErRV6qDMC2GuLOMLK5-AaiC5cMb55juX0swUrwfd3A_dsPdp1XFEu0hPhJ3TePUs9T4RrKnzn4uWNWvJdw7Ttt1sA4Wts',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqpEF2HztR3lHpXF6xUQnk1Kz_uME_OhCMnhX9KFKEcJ0fkfE-7_QT9cLh3v4yCzvcOCrT-xtGdzPEIn6hXze_jkW0zHTcRDLEBsK1NYa9DD_3JG3jCS1PNiST3hkpcKkz-mSfWj7haSw6zbkAnhLjTJ6xHL0rmEOKkQCLam-T29c4up6fMfAFTTrjshsFsQFHVoIm7OwEOV42hfDZ0J0JAGY_BcB2WOgpTqAUPvFb-XBP4QuoBh_cCI09GCz0xXjPkyww00l0M6c',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkYkltb7C1HhoFW_sPq4ZhWROBVjha-fkQFtwrkaVmc6SX6QNg317VZtoQM7Jg1rm57_FNUTARTr2yHRjny3DvmwiTPr4hhPMcWQC323L0dcXPyTGOXj5nev2Zayo6kLfS6QZ0HrPPF1CCdH9uFcNieUOy6nR7EkWuuTUktP85Tr4YiLK2U1iY1LL2shApCLRfvWwx3XcRAxEiCbFxEMFowN4cEEyJZxatS1WI4tArZHLpISRlJk7Sfuw_LqPz5Y5DKZrFLPMm1dw',
]

const defaultCards = [
  { tag: 'Akan Datang', title: 'Gotong-royong Perdana & Taman Herba', date: '2024-08-12', summary: 'Bersih kawasan blok & perasmian taman herba.' },
  { tag: 'Sukan', title: 'Liga Futsal Komuniti', summary: 'Pertandingan santai hujung minggu.' },
  { tag: 'Perayaan', title: 'Jamuan Hari Raya Blok B', summary: 'Jamuan bersama jiran tetangga.' },
]

export default function Aktiviti(){
  const [cards, setCards] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    const storageKey = 'pageDataV1'
    const pageKey = 'komuniti'
    const saved = localStorage.getItem(storageKey)
    if (!saved) {
      const seeded = { [pageKey]: { title: 'Aktiviti Komuniti', subtitle: '', cards: defaultCards.map(c=>({ id: crypto.randomUUID(), ...c })) } }
      localStorage.setItem(storageKey, JSON.stringify(seeded))
      setCards(seeded[pageKey].cards)
      return
    }
    try{
      const parsed = JSON.parse(saved)
      if (!parsed[pageKey] || !Array.isArray(parsed[pageKey].cards)){
        const seeded = { ...parsed, ...{ [pageKey]: { title: 'Aktiviti Komuniti', subtitle: '', cards: defaultCards.map(c=>({ id: crypto.randomUUID(), ...c })) } } }
        localStorage.setItem(storageKey, JSON.stringify(seeded))
        setCards(seeded[pageKey].cards)
        return
      }
      setCards(parsed[pageKey].cards.map(c=>({ id: c.id || crypto.randomUUID(), ...c })))
    }catch(e){
      const seeded = { [pageKey]: { title: 'Aktiviti Komuniti', subtitle: '', cards: defaultCards.map(c=>({ id: crypto.randomUUID(), ...c })) } }
      localStorage.setItem(storageKey, JSON.stringify(seeded))
      setCards(seeded[pageKey].cards)
    }
  }, [])

  const visible = cards.filter(card => {
    if (filter === 'all') return true
    return (card.tag || '').toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-20 py-12">
      <div className="bg-primary/5 py-2 px-4 text-center border-b border-primary/10 mb-6">
        <p className="text-xs md:text-sm font-medium text-primary flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">emoji_nature</span>
          <span>Notis: Penjagaan taman tahunan dijalankan hujung minggu ini.</span>
        </p>
      </div>

      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Aktiviti Komuniti Banjaria</h1>
        <p className="text-muted-teal text-lg max-w-2xl leading-relaxed font-medium">Terokai dan sertai pelbagai acara menarik yang dianjurkan untuk mengeratkan silaturahim sesama jiran tetangga di kediaman kita.</p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-12" role="toolbar" aria-label="activity filters">
        {['all','Akan Datang','Sukan','Perayaan','Sukarelawan'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} data-filter={f} className={`flex h-10 items-center justify-center rounded-xl px-6 text-sm font-medium ${filter===f ? 'bg-primary text-white shadow-lg' : 'bg-[#eaf0ef] dark:bg-white/5 text-[#111816] dark:text-white'}`}>
            {f==='Sukan' ? 'Sukan & Rekreasi' : f}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">
        {visible.length === 0 && <p className="text-center text-muted-teal">Tiada aktiviti untuk kategori ini.</p>}
        {visible.map((card, idx) => {
          const image = card.image || fallbackImages[idx % fallbackImages.length]
          const dateLabel = card.date ? new Date(card.date).toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' }) : ''
          const cta = (card.tag || '').toLowerCase().includes('sukan') ? 'Daftar Sekarang' : 'Baca Lanjut'
          return (
            <article key={card.id} className="group cursor-pointer flex flex-col h-full">
              <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 flex flex-col h-full">
                <div className="relative overflow-hidden aspect-[3/2] bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }}>
                  <div className="absolute top-4 left-4 bg-accent-warm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{card.tag || 'Aktiviti'}</div>
                </div>
                <div className="p-6 flex flex-col grow">
                  {dateLabel && <div className="flex items-center gap-2 text-primary text-xs font-bold mb-3 uppercase tracking-widest"><span className="material-symbols-outlined text-sm">calendar_today</span>{dateLabel}</div>}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-muted-teal text-sm leading-relaxed mb-4 grow">{card.summary}</p>
                  <button className="flex items-center gap-2 text-primary font-bold text-sm mt-auto">{cta}<span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span></button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <div className="mt-16 text-center">
        <button className="inline-flex items-center gap-3 px-8 py-3 rounded-xl border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 transition-colors">
          <span className="material-symbols-outlined">refresh</span>
          Lihat Aktiviti Terdahulu
        </button>
      </div>
    </div>
  )
}
