import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS } from './i18n'
import { MARKETS, formatPrice } from './data/markets'
import { MENU, getItem } from './data/menu'
import { seedOrders } from './data/seed'

const KEYS = {
  prefs: 'fahm.prefs',
  cart: 'fahm.cart',
  orders: 'fahm.orders',
  menu: 'fahm.menu',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function usePersisted(key, initial) {
  const [value, setValue] = useState(() => load(key, typeof initial === 'function' ? initial() : initial))
  useEffect(() => {
    save(key, value)
  }, [key, value])
  // keep tabs in sync (store <-> dashboard)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key && e.newValue) setValue(JSON.parse(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])
  return [value, setValue]
}

const Ctx = createContext(null)

/** Price of one unit of a cart line, given chosen options. */
export function unitPrice(item, opts, market) {
  let p = item.price[market]
  const o = item.options
  if (!o) return p
  if (opts.size && o.sizes) p += o.sizes.find((s) => s.id === opts.size)?.price[market] ?? 0
  if (opts.extras && o.extras) for (const id of opts.extras) p += o.extras.find((e) => e.id === id)?.price[market] ?? 0
  if (opts.combo && o.combo) p += o.combo.price[market]
  return p
}

export function StoreProvider({ children }) {
  const [prefs, setPrefs] = usePersisted(KEYS.prefs, { lang: 'ar', market: 'SA' })
  const [cart, setCart] = usePersisted(KEYS.cart, [])
  const [orders, setOrders] = usePersisted(KEYS.orders, seedOrders)
  const [menuState, setMenuState] = usePersisted(KEYS.menu, {}) // { [id]: { available, price: {SA,EG} } }

  const { lang, market } = prefs

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const t = useCallback(
    (key, vars) => {
      let s = STRINGS[lang][key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
      return s
    },
    [lang],
  )

  const menu = useMemo(
    () =>
      MENU.map((m) => {
        const o = menuState[m.id] || {}
        return { ...m, available: o.available ?? true, price: o.price ?? m.price }
      }),
    [menuState],
  )
  const findItem = useCallback((id) => menu.find((m) => m.id === id) ?? getItem(id), [menu])

  const price = useCallback((n) => formatPrice(n, market, lang), [market, lang])
  const L = useCallback((obj) => (obj ? obj[lang] ?? obj.ar : ''), [lang])

  // ---- cart ----
  const lineKey = (id, opts) => `${id}|${opts.size ?? ''}|${(opts.extras ?? []).slice().sort().join(',')}|${opts.combo ? 1 : 0}|${opts.notes ?? ''}`

  const addToCart = useCallback(
    (id, opts = {}, qty = 1) => {
      setCart((c) => {
        const key = lineKey(id, opts)
        const i = c.findIndex((l) => l.key === key)
        if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l))
        return [...c, { key, id, opts, qty }]
      })
    },
    [setCart],
  )
  const setQty = useCallback(
    (key, qty) => setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty } : l)))),
    [setCart],
  )
  const clearCart = useCallback(() => setCart([]), [setCart])

  const m = MARKETS[market]
  const cartLines = cart
    .map((l) => {
      const item = findItem(l.id)
      if (!item) return null
      const unit = unitPrice(item, l.opts, market)
      return { ...l, item, unit, total: unit * l.qty }
    })
    .filter(Boolean)
  const subtotal = cartLines.reduce((s, l) => s + l.total, 0)
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)
  const deliveryFee = subtotal >= m.freeDeliveryOver || subtotal === 0 ? 0 : m.deliveryFee

  // ---- orders ----
  const placeOrder = useCallback(
    ({ customer, type, payment }) => {
      const fee = type === 'pickup' ? 0 : deliveryFee
      const nextNo = Math.max(1040, ...orders.map((o) => Number(o.id.split('-')[1]) || 0)) + 1
      const order = {
        id: `F-${nextNo}`,
        createdAt: Date.now(),
        market,
        lang,
        customer,
        type,
        payment,
        items: cartLines.map((l) => ({ id: l.id, qty: l.qty, opts: l.opts, unit: l.unit })),
        subtotal,
        delivery: fee,
        total: subtotal + fee,
        status: 'new',
        fresh: true,
      }
      setOrders((os) => [order, ...os])
      setCart([])
      return order.id
    },
    [cartLines, subtotal, deliveryFee, market, lang, orders, setOrders, setCart],
  )

  const updateOrder = useCallback(
    (id, patch) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    [setOrders],
  )

  const updateMenuItem = useCallback(
    (id, patch) => setMenuState((s) => ({ ...s, [id]: { ...s[id], ...patch } })),
    [setMenuState],
  )

  const resetDemo = useCallback(() => {
    setOrders(seedOrders())
    setMenuState({})
    setCart([])
  }, [setOrders, setMenuState, setCart])

  const value = {
    lang,
    market,
    marketInfo: m,
    setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
    setMarket: (market) => setPrefs((p) => ({ ...p, market })),
    t,
    L,
    price,
    menu,
    findItem,
    cartLines,
    cartCount,
    subtotal,
    deliveryFee,
    addToCart,
    setQty,
    clearCart,
    orders,
    placeOrder,
    updateOrder,
    updateMenuItem,
    resetDemo,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
