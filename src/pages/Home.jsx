import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { CATEGORIES } from '../data/menu'
import FoodArt from '../components/FoodArt'
import ItemModal from '../components/ItemModal'
import { Flame } from '../components/ui'
import { useCartUI } from './StoreLayout'

export default function Home() {
  const { t, L, price, menu, market, marketInfo, addToCart, lang } = useStore()
  const { bump } = useCartUI()
  const [active, setActive] = useState(CATEGORIES[0].id)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const sections = useRef({})

  // highlight the category in view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.dataset.cat)
      },
      { rootMargin: '-140px 0px -55% 0px' },
    )
    Object.values(sections.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const jump = (id) => {
    const el = sections.current[id]
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' })
  }

  const showToast = (item) => {
    bump()
    setToast(L(item.name))
    clearTimeout(showToast.tm)
    showToast.tm = setTimeout(() => setToast(null), 1800)
  }

  const quickAdd = (item) => {
    if (item.options) return setSelected(item)
    addToCart(item.id, {}, 1)
    showToast(item)
  }

  const hero = menu.find((m) => m.id === 'classic')

  return (
    <>
      {/* HERO */}
      <section className="ember-glow grain relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pt-10 pb-14 md:grid-cols-2 md:pt-16 md:pb-20">
          <div className="animate-rise text-center md:text-start">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-char px-3 py-1 text-sm font-bold text-mustard">
              <Flame className="h-4 w-4" /> {t('tagline')}
            </p>
            <h1 className="font-display text-6xl leading-[1.05] sm:text-7xl lg:text-8xl">
              {t('heroTitle1')}
              <br />
              <span className="text-ember">{t('heroTitle2')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-smoke md:mx-0">{t('heroSub')}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <button onClick={() => setSelected(hero)} className="rounded-full bg-ember px-7 py-3.5 font-extrabold text-white shadow-lg shadow-ember/30 transition hover:bg-ember-dark active:scale-95">
                {t('orderNow')} 🔥
              </button>
              <button onClick={() => jump('burgers')} className="rounded-full border-2 border-ash px-7 py-3.5 font-extrabold hover:border-cream">
                {t('viewMenu')}
              </button>
            </div>
            <dl className="mt-8 flex justify-center gap-6 text-center md:justify-start">
              <div><dt className="text-xs text-smoke">{t('deliveryTime')}</dt><dd className="text-lg font-extrabold">25–30 {t('minutes')}</dd></div>
              <div className="w-px bg-ash" />
              <div><dt className="text-xs text-smoke">{t('rating')}</dt><dd className="text-lg font-extrabold">⭐ 4.8 <span className="text-xs font-normal text-smoke">(2.3k)</span></dd></div>
              <div className="w-px bg-ash" />
              <div><dt className="text-xs text-smoke">{t('freeDeliveryOver')}</dt><dd className="text-lg font-extrabold">{price(marketInfo.freeDeliveryOver)}</dd></div>
            </dl>
          </div>
          <div className="relative">
            <div className="absolute inset-x-10 bottom-6 h-16 rounded-full bg-ember/50 blur-3xl" />
            <FoodArt art={{ kind: 'burger', patties: 2, cheese: true, lettuce: true, tomato: true, onion: true }} className="relative mx-auto w-full max-w-md drop-shadow-[0_30px_40px_rgba(0,0,0,.6)]" />
            <div className="absolute top-4 start-2 rotate-[-8deg] rounded-2xl bg-mustard px-4 py-2 font-display text-2xl text-coal shadow-xl sm:start-8">
              {price(hero.price[market] ?? 0)}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <nav className="sticky top-[69px] z-20 border-b border-ash/60 bg-coal/90 backdrop-blur-md">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => jump(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${active === c.id ? 'bg-cream text-coal' : 'bg-char text-smoke hover:text-cream'}`}
            >
              <span className="me-1">{c.icon}</span>
              {L(c.name)}
            </button>
          ))}
        </div>
      </nav>

      {/* MENU */}
      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-8">
        {CATEGORIES.map((c) => (
          <section key={c.id} ref={(el) => (sections.current[c.id] = el)} data-cat={c.id} aria-labelledby={`h-${c.id}`}>
            <h2 id={`h-${c.id}`} className="mb-4 font-display text-3xl">{L(c.name)}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu.filter((m) => m.category === c.id).map((item) => (
                <article
                  key={item.id}
                  className={`group relative flex overflow-hidden rounded-3xl bg-char transition sm:flex-col ${item.available ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40' : 'opacity-50'}`}
                >
                  <button
                    disabled={!item.available}
                    onClick={() => setSelected(item)}
                    className="relative grid w-32 shrink-0 place-items-center bg-gradient-to-b from-ash/40 to-transparent p-3 sm:w-full sm:p-6"
                    aria-label={L(item.name)}
                  >
                    <FoodArt art={item.art} className="h-24 w-auto transition group-hover:scale-105 sm:h-40" />
                    {item.badge && (
                      <span className="absolute top-2 start-2 rounded-full bg-mustard px-2 py-0.5 text-[11px] font-extrabold text-coal sm:top-4 sm:start-4 sm:text-xs">{L(item.badge)}</span>
                    )}
                  </button>
                  <div className="flex flex-1 flex-col p-4 sm:pt-0">
                    <h3 className="font-extrabold text-lg leading-tight">{L(item.name)}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-smoke">{L(item.desc)}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-lg font-extrabold text-mustard">{price(item.price[market])}</span>
                      {item.available ? (
                        <button onClick={() => quickAdd(item)} className="rounded-full bg-ember px-4 py-2 text-sm font-extrabold text-white transition hover:bg-ember-dark active:scale-90">
                          + {t('add')}
                        </button>
                      ) : (
                        <span className="rounded-full bg-ash px-3 py-1.5 text-xs font-bold">{t('soldOut')}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <p className="text-center text-xs text-smoke">{L(marketInfo.taxNote)}</p>
      </div>

      {selected && (
        <ItemModal
          key={selected.id + lang}
          item={selected}
          onClose={(added) => {
            if (added) showToast(selected)
            setSelected(null)
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 top-24 z-50 flex justify-center px-4" role="status">
          <div className="animate-rise rounded-full bg-cream px-5 py-2.5 font-bold text-coal shadow-2xl">✓ {toast}</div>
        </div>
      )}
    </>
  )
}
