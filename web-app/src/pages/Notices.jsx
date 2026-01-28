import React, { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

const defaultNotices = [
  { title: 'Gangguan Bekalan Air Sementara', category: 'Penyelenggaraan', date: '2023-10-15', summary: 'Kerja pembaikan paip utama di Blok A akan dijalankan 9:00 pagi - 5:00 petang.' },
  { title: 'Mesyuarat Agung Tahunan (AGM)', category: 'Umum', date: '2023-11-20', summary: 'Kehadiran semua pemilik dialu-alukan bagi membincangkan pelantikan jawatankuasa baharu.' },
  { title: 'Projek Keceriaan Taman', category: 'Aktiviti', date: '2023-10-10', summary: 'Penambahan landskap di zon rekreasi Fasa 2 dengan lebih banyak pokok teduhan.' },
]

export default function Notices() {
  const [notices, setNotices] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('Semua')
  const [open, setOpen] = useState(false)
  const [modalNotice, setModalNotice] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('notices')
    try {
      const parsed = JSON.parse(saved || 'null')
      setNotices(Array.isArray(parsed) && parsed.length ? parsed : defaultNotices)
    } catch (e) {
      setNotices(defaultNotices)
    }
  }, [])

  const categories = ['Semua', ...Array.from(new Set(notices.map(n => n.category)))]
  const filtered = notices.filter(n => (selected === 'Semua' || n.category === selected) && (`${n.title} ${n.summary}`.toLowerCase().includes(query.toLowerCase())))

  function openModal(n) { setModalNotice(n); setOpen(true) }
  function closeModal() { setOpen(false); setModalNotice(null) }

  return (
    <div>
      <div className="hero-bg rounded-3xl border border-primary/10 shadow-lg px-6 py-12 mb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-primary/10 shadow-sm mb-6 text-xs font-bold uppercase tracking-widest">
            Papan Kenyataan
          </div>
          <h1 className="text-3xl font-extrabold mb-3">Notis & Pengumuman</h1>
          <p className="text-[#60857d]">Kekal maklum dengan berita terkini, jadual penyelenggaraan, dan aktiviti komuniti kita.</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-[#eaf0ef] mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 px-3">
          <input className="w-full text-sm bg-transparent outline-none" placeholder="Cari notis..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="w-full md:w-64">
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-[#eaf0ef] px-4 py-2 text-left flex items-center justify-between text-sm">
                <span>{selected}</span>
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-2 w-full bg-white border border-[#eaf0ef] rounded-xl shadow-lg py-1">
                  {categories.map(cat => (
                    <Listbox.Option key={cat} value={cat} className={({ active }) => `px-4 py-2 text-sm cursor-pointer ${active ? 'bg-primary/10' : ''}`}>
                      {({ selected }) => (<div className="flex items-center justify-between"><span>{cat}</span>{selected && <CheckIcon className="w-4 h-4 text-primary"/>}</div>)}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <p className="text-sm text-[#60857d]">Tiada notis buat masa ini.</p>}
        {filtered.map((n, idx) => (
          <article key={idx} className="group bg-white rounded-2xl border border-[#eaf0ef] p-4 flex items-start gap-4">
            <div className="w-28 h-28 rounded-xl bg-gray-100 card-img" style={{backgroundImage: `url('/assets/paper-people-chain.jpg')`}} />
            <div className="flex-1">
              <div className="text-xs text-[#60857d] mb-1">{new Date(n.date).toLocaleDateString('ms-MY') || ''} • {n.category}</div>
              <h3 className="font-bold text-lg mb-1">{n.title}</h3>
              <p className="text-sm text-[#60857d] mb-3 line-clamp-2">{n.summary}</p>
              <div>
                <button onClick={() => openModal(n)} className="text-primary font-bold text-sm inline-flex items-center gap-1">Baca Lanjut <span className="material-symbols-outlined" aria-hidden>arrow_forward</span></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl p-6">
                  <Dialog.Title className="text-xl font-bold">{modalNotice?.title}</Dialog.Title>
                  <p className="text-xs text-[#60857d] mt-1">{modalNotice ? new Date(modalNotice.date).toLocaleDateString('ms-MY') : ''} • {modalNotice?.category}</p>
                  <div className="mt-4 text-sm text-[#455d58]">{modalNotice?.summary}</div>
                  <div className="mt-6 text-right">
                    <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-primary text-white font-bold">Tutup</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
