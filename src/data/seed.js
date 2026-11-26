import { MENU } from './menu'
import { MARKETS } from './markets'

const NAMES = {
  SA: ['عبدالله الشهري', 'نورة القحطاني', 'فيصل العتيبي', 'سارة الدوسري', 'محمد الغامدي', 'ريم الزهراني', 'خالد المطيري', 'لمى الحربي'],
  EG: ['أحمد مصطفى', 'منة الله سعيد', 'كريم عادل', 'ياسمين حسن', 'عمر خالد', 'نورهان علي', 'محمود سامي', 'هبة إبراهيم'],
}
const AREAS = {
  SA: ['حي النرجس', 'حي الملقا', 'حي الياسمين', 'حي العليا', 'حي الصحافة'],
  EG: ['التجمع الخامس', 'مدينة نصر', 'المعادي', 'الشيخ زايد', 'مصر الجديدة'],
}

// deterministic pseudo-random so the demo looks the same every reset
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function seedOrders() {
  const r = rng(42)
  const pick = (arr) => arr[Math.floor(r() * arr.length)]
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).getTime()
  const span = Math.max(now.getTime() - startOfDay, 3 * 3600e3)
  const orders = []
  const N = 26
  for (let i = 0; i < N; i++) {
    const market = i % 3 === 0 ? 'EG' : 'SA'
    const mk = MARKETS[market]
    const count = 1 + Math.floor(r() * 3)
    const items = []
    for (let k = 0; k < count; k++) {
      const item = pick(MENU)
      if (items.some((x) => x.id === item.id)) continue
      items.push({ id: item.id, qty: 1 + Math.floor(r() * 2), opts: {}, unit: item.price[market] })
    }
    const subtotal = items.reduce((s, x) => s + x.unit * x.qty, 0)
    const type = r() < 0.75 ? 'delivery' : 'pickup'
    const delivery = type === 'pickup' || subtotal >= mk.freeDeliveryOver ? 0 : mk.deliveryFee
    // spread orders over the last `span`, oldest first, newest a few minutes ago
    const createdAt = now.getTime() - span * (1 - i / N) - Math.floor(r() * 240e3) - 3 * 60e3
    const age = now.getTime() - createdAt
    const status = age < 30 * 60e3 ? 'new' : age < 70 * 60e3 ? 'preparing' : age < 110 * 60e3 ? (type === 'pickup' ? 'ready' : 'out') : r() < 0.06 ? 'cancelled' : 'delivered'
    orders.push({
      id: `F-${1000 + i + 1}`,
      createdAt,
      market,
      lang: 'ar',
      customer: { name: pick(NAMES[market]), phone: `${mk.phonePrefix} ${market === 'SA' ? '5' : '1'}${Math.floor(10000000 + r() * 89999999)}`, address: `${pick(AREAS[market])}، ${mk.city.ar}` },
      type,
      payment: pick(mk.payments).id,
      items,
      subtotal,
      delivery,
      total: subtotal + delivery,
      status,
    })
  }
  return orders.sort((a, b) => b.createdAt - a.createdAt)
}
