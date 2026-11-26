import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { STATUS_FLOW } from '../i18n'
import { MARKETS, formatPrice } from '../data/markets'
import { CATEGORIES } from '../data/menu'
import FoodArt from '../components/FoodArt'
import { DemoBanner, Logo, StatusPill, Toggles } from '../components/ui'

function timeAgo(ts, lang) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000))
  const rtf = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en', { numeric: 'auto', style: 'short' })
  if (mins < 60) return rtf.format(-mins, 'minute')
  return rtf.format(-Math.round(mins / 60), 'hour')
}

function useTick(ms) {
  const [, set] = useState(0)
  useEffect(() => {
    const i = setInterval(() => set((x) => x + 1), ms)
    return () => clearInterval(i)
  }, [ms])
}

export default function Admin() {
  const { t, lang } = useStore()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('fahm.admin') === '1')
  const [tab, setTab] = useState('dashboard')

  if (!authed) {
    return (
      <div className="flex min-h-dvh flex-col">
        <DemoBanner />
        <div className="ember-glow grain flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-sm animate-rise rounded-3xl bg-char p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center"><Logo /></div>
            <h1 className="font-display text-2xl">{t('adminWelcome')}</h1>
            <p className="mt-2 text-sm text-smoke">{t('adminDemoNote')}</p>
            <button
              onClick={() => { sessionStorage.setItem('fahm.admin', '1'); setAuthed(true) }}
              className="mt-6 w-full rounded-full bg-ember py-3.5 font-extrabold text-white hover:bg-ember-dark"
            >
              {t('enterDemo')} →
            </button>
            <div className="mt-4 flex justify-center"><Toggles /></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    ['dashboard', '📊', t('dashboard')],
    ['orders', '🧾', t('orders')],
    ['menu', '🍔', t('menuMgmt')],
  ]

  return (
    <div className="min-h-dvh bg-[#120e0c]">
      <DemoBanner />
      <header className="sticky top-0 z-30 border-b border-ash/60 bg-coal/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo to="/admin" small />
            <span className="hidden rounded-full bg-ember/15 px-2.5 py-0.5 text-xs font-bold text-ember sm:inline">{t('admin')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Toggles compact />
            <Link to="/" className="hidden rounded-full border border-ash px-3 py-1 text-sm font-bold hover:border-ember sm:inline-block">{t('viewStore')} ↗</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4" aria-label={t('admin')}>
          {tabs.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${tab === id ? 'border-ember text-cream' : 'border-transparent text-smoke hover:text-cream'}`}
              aria-current={tab === id ? 'page' : undefined}
            >
              <span className="me-1.5">{icon}</span>{label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6" key={lang}>
        {tab === 'dashboard' && <Dashboard goOrders={() => setTab('orders')} />}
        {tab === 'orders' && <Orders />}
        {tab === 'menu' && <MenuMgmt />}
      </main>
      <NewOrderToast />
    </div>
  )
}

function NewOrderToast() {
  const { orders, t } = useStore()
  const seen = useRef(new Set(orders.map((o) => o.id)))
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    const fresh = orders.filter((o) => !seen.current.has(o.id))
    fresh.forEach((o) => seen.current.add(o.id))
    if (fresh.length) {
      setMsg(`${t('newOrderToast')} #${fresh[0].id}`)
      const tm = setTimeout(() => setMsg(null), 4000)
      return () => clearTimeout(tm)
    }
  }, [orders, t])
  if (!msg) return null
  return (
    <div className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rtl:translate-x-1/2" role="status">
      <div className="animate-rise flex items-center gap-2 rounded-full bg-mustard px-5 py-3 font-extrabold text-coal shadow-2xl">🔔 {msg}</div>
    </div>
  )
}

function useMarketOrders() {
  const { orders, market } = useStore()
  return useMemo(() => orders.filter((o) => o.market === market), [orders, market])
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl bg-char p-4">
      <p className="text-xs font-bold text-smoke">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ?? ''}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-smoke">{sub}</p>}
    </div>
  )
}

function Dashboard({ goOrders }) {
  const { t, L, price, findItem, lang } = useStore()
  const orders = useMarketOrders()
  useTick(30000)

  const valid = orders.filter((o) => o.status !== 'cancelled')
  const revenue = valid.reduce((s, o) => s + o.total, 0)
  const active = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length

  const byHour = useMemo(() => {
    const map = new Map()
    for (const o of valid) {
      const h = new Date(o.createdAt).getHours()
      map.set(h, (map.get(h) ?? 0) + o.total)
    }
    const hours = [...map.keys()]
    if (!hours.length) return []
    const min = Math.min(...hours), max = Math.max(...hours)
    return Array.from({ length: max - min + 1 }, (_, i) => ({ h: min + i, v: map.get(min + i) ?? 0 }))
  }, [valid])
  const peak = Math.max(1, ...byHour.map((b) => b.v))

  const top = useMemo(() => {
    const m = new Map()
    for (const o of valid) for (const it of o.items) m.set(it.id, (m.get(it.id) ?? 0) + it.qty)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [valid])
  const topMax = Math.max(1, ...top.map(([, q]) => q))

  return (
    <div className="space-y-5 animate-rise">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('todayOrders')} value={orders.length} />
        <Stat label={t('revenue')} value={price(revenue)} accent="text-mustard" />
        <Stat label={t('avgOrder')} value={price(valid.length ? Math.round(revenue / valid.length) : 0)} />
        <Stat label={t('activeOrders')} value={active} accent="text-ember" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl bg-char p-5">
          <h2 className="mb-4 font-extrabold">{t('salesByHour')}</h2>
          <div className="flex h-48 items-end gap-1.5" dir="ltr">
            {byHour.map((b) => (
              <div key={b.h} className="group flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full">
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-cream px-1.5 py-0.5 text-[10px] font-bold text-coal opacity-0 transition group-hover:opacity-100">{price(b.v)}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-ember-dark to-ember transition group-hover:to-mustard" style={{ height: `${Math.max(3, (b.v / peak) * 170)}px` }} />
                </div>
                <span className="text-[10px] text-smoke">{b.h}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-char p-5">
          <h2 className="mb-4 font-extrabold">{t('topItems')}</h2>
          <ul className="space-y-3">
            {top.map(([id, q]) => {
              const item = findItem(id)
              return (
                <li key={id} className="flex items-center gap-3">
                  <FoodArt art={item.art} className="h-9 w-11 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm"><span className="font-bold">{L(item.name)}</span><span className="text-smoke">{q} {t('sold')}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-ash"><div className="h-full rounded-full bg-mustard" style={{ width: `${(q / topMax) * 100}%` }} /></div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl bg-char p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold">{t('recentOrders')}</h2>
          <button onClick={goOrders} className="text-sm font-bold text-ember hover:underline">{t('orders')} →</button>
        </div>
        <ul className="divide-y divide-ash/60">
          {orders.slice(0, 6).map((o) => (
            <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-16 font-bold text-mustard" dir="ltr">#{o.id.split('-')[1]}</span>
              <span className="flex-1 truncate">{o.customer.name}</span>
              <span className="hidden text-smoke sm:inline">{timeAgo(o.createdAt, lang)}</span>
              <StatusPill status={o.status} />
              <span className="w-24 text-end font-bold">{price(o.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Orders() {
  const { t, L, lang, updateOrder, findItem } = useStore()
  const orders = useMarketOrders()
  const [filter, setFilter] = useState('active')
  useTick(30000)

  const filters = [
    ['active', t('activeOrders')],
    ['new', t('status_new')],
    ['preparing', t('status_preparing')],
    ['done', t('status_delivered')],
    ['all', t('all')],
  ]
  const shown = orders.filter((o) =>
    filter === 'all' ? true
      : filter === 'active' ? !['delivered', 'cancelled'].includes(o.status)
      : filter === 'done' ? ['delivered', 'cancelled'].includes(o.status)
      : o.status === filter,
  )

  return (
    <div className="animate-rise">
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {filters.map(([id, label]) => {
          const n = orders.filter((o) =>
            id === 'all' ? true : id === 'active' ? !['delivered', 'cancelled'].includes(o.status) : id === 'done' ? ['delivered', 'cancelled'].includes(o.status) : o.status === id,
          ).length
          return (
            <button key={id} onClick={() => setFilter(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === id ? 'bg-cream text-coal' : 'bg-char text-smoke hover:text-cream'}`}>
              {label} <span className="opacity-60">({n})</span>
            </button>
          )
        })}
      </div>

      {shown.length === 0 && <p className="py-16 text-center text-smoke">{t('noOrders')}</p>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((o) => {
          const flow = STATUS_FLOW[o.type]
          const next = flow[flow.indexOf(o.status) + 1]
          const done = ['delivered', 'cancelled'].includes(o.status)
          const p = (n) => formatPrice(n, o.market, lang)
          const pay = MARKETS[o.market].payments.find((x) => x.id === o.payment)
          return (
            <article key={o.id} className={`rounded-2xl bg-char p-4 ${o.status === 'new' ? 'ring-2 ring-mustard/60' : ''}`}>
              <header className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-extrabold" dir="ltr">#{o.id}</p>
                  <p className="text-xs text-smoke">{timeAgo(o.createdAt, lang)} · {o.type === 'delivery' ? `🛵 ${t('deliveryOpt')}` : `🏪 ${t('pickupOpt')}`}</p>
                </div>
                <StatusPill status={o.status} />
              </header>
              <div className="mb-3 rounded-xl bg-coal p-3 text-sm">
                <p className="font-bold">{o.customer.name}</p>
                <p className="text-smoke" dir="ltr" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>{o.customer.phone}</p>
                {o.customer.address && <p className="text-smoke">{o.customer.address}</p>}
              </div>
              <ul className="mb-3 space-y-1 text-sm">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.qty}× {L(findItem(it.id)?.name)}</span>
                    <span className="text-smoke">{p(it.unit * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mb-3 flex justify-between border-t border-ash pt-2 text-sm">
                <span className="text-smoke">{L(pay?.name)}</span>
                <span className="font-extrabold text-mustard">{p(o.total)}</span>
              </div>
              {!done && (
                <div className="flex gap-2">
                  {next && (
                    <button onClick={() => updateOrder(o.id, { status: next })} className="flex-1 rounded-full bg-ember py-2.5 text-sm font-extrabold text-white hover:bg-ember-dark">
                      {t(`status_${next}`)} →
                    </button>
                  )}
                  <button onClick={() => updateOrder(o.id, { status: 'cancelled' })} className="rounded-full border border-ash px-4 py-2.5 text-sm font-bold text-smoke hover:border-red-500 hover:text-red-400">
                    {t('cancel')}
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function MenuMgmt() {
  const { t, L, menu, market, marketInfo, updateMenuItem, resetDemo } = useStore()
  return (
    <div className="animate-rise space-y-6">
      {CATEGORIES.map((c) => (
        <section key={c.id}>
          <h2 className="mb-2 font-extrabold">{c.icon} {L(c.name)}</h2>
          <div className="overflow-hidden rounded-2xl bg-char">
            {menu.filter((m) => m.category === c.id).map((m) => (
              <div key={m.id} className="flex items-center gap-3 border-b border-ash/60 p-3 last:border-0">
                <FoodArt art={m.art} className={`h-11 w-14 shrink-0 ${m.available ? '' : 'opacity-40 grayscale'}`} />
                <span className={`flex-1 font-bold ${m.available ? '' : 'text-smoke line-through'}`}>{L(m.name)}</span>
                <label className="flex items-center gap-1.5 text-sm">
                  <span className="sr-only">{t('price')}</span>
                  <input
                    type="number"
                    min="0"
                    value={m.price[market]}
                    onChange={(e) => updateMenuItem(m.id, { price: { ...m.price, [market]: Math.max(0, Number(e.target.value)) } })}
                    className="w-20 rounded-lg border border-ash bg-coal px-2 py-1.5 text-center font-bold outline-none focus:border-ember"
                  />
                  <span className="text-smoke">{L(marketInfo.currency)}</span>
                </label>
                <label className="relative inline-flex cursor-pointer items-center" title={t('available')}>
                  <input type="checkbox" className="peer sr-only" checked={m.available} onChange={(e) => updateMenuItem(m.id, { available: e.target.checked })} />
                  <span className="h-6 w-11 rounded-full bg-ash transition peer-checked:bg-leaf" />
                  <span className="absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
                  <span className="sr-only">{t('available')}</span>
                </label>
              </div>
            ))}
          </div>
        </section>
      ))}
      <button onClick={resetDemo} className="rounded-full border border-ash px-5 py-2.5 text-sm font-bold text-smoke hover:border-ember hover:text-cream">
        ↺ {t('resetDemo')}
      </button>
    </div>
  )
}
