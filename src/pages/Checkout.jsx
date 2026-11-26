import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import FoodArt from '../components/FoodArt'
import { optionsLabel } from '../components/CartDrawer'
import { Flag } from '../components/ui'

function PayBadge({ id }) {
  const map = {
    mada: <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-black text-[#0a5c9c]">mada</span>,
    applepay: <span className="rounded bg-black px-1.5 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/30">Apple Pay</span>,
    tabby: <span className="rounded bg-[#3bffc1] px-1.5 py-0.5 text-[11px] font-black text-black">tabby</span>,
    stcpay: <span className="rounded bg-[#4f008c] px-1.5 py-0.5 text-[11px] font-black text-white">stc pay</span>,
    card: <span className="text-lg">💳</span>,
    instapay: <span className="rounded bg-[#5b2a86] px-1.5 py-0.5 text-[11px] font-black text-white">InstaPay</span>,
    fawry: <span className="rounded bg-[#ffd200] px-1.5 py-0.5 text-[11px] font-black text-[#004b87]">fawry</span>,
    cod: <span className="text-lg">💵</span>,
  }
  return map[id] ?? null
}

export default function Checkout() {
  const { t, L, price, cartLines, subtotal, deliveryFee, marketInfo, placeOrder, market } = useStore()
  const navigate = useNavigate()
  const [type, setType] = useState('delivery')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [payment, setPayment] = useState(marketInfo.payments[0].id)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (cartLines.length === 0 && !busy) return <Navigate to="/" replace />

  // payment list changes with market
  const validPayment = marketInfo.payments.some((p) => p.id === payment) ? payment : marketInfo.payments[0].id
  const fee = type === 'pickup' ? 0 : deliveryFee
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = true
    if (form.phone.replace(/\D/g, '').length < 8) errs.phone = true
    if (type === 'delivery' && !form.address.trim()) errs.address = true
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setTimeout(() => {
      const id = placeOrder({
        customer: { name: form.name.trim(), phone: `${marketInfo.phonePrefix} ${form.phone.trim()}`, address: type === 'delivery' ? form.address.trim() : '' },
        type,
        payment: validPayment,
      })
      navigate(`/order/${id}`, { replace: true })
    }, 1400)
  }

  const input = (err) => `w-full rounded-xl border bg-coal px-4 py-3 outline-none transition focus:border-ember ${err ? 'border-red-500' : 'border-ash'}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-smoke hover:text-cream">
        <span className="rtl:rotate-180">←</span> {t('back')}
      </Link>
      <h1 className="mb-6 font-display text-4xl">{t('checkoutTitle')}</h1>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-6">
          <section className="rounded-3xl bg-char p-5">
            <h2 className="mb-3 font-extrabold">{t('orderType')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[['delivery', '🛵', t('deliveryOpt')], ['pickup', '🏪', t('pickupOpt')]].map(([id, icon, label]) => (
                <label key={id} className={`cursor-pointer rounded-2xl border-2 p-4 text-center font-bold transition ${type === id ? 'border-ember bg-ember/10' : 'border-ash'}`}>
                  <input type="radio" name="type" className="sr-only" checked={type === id} onChange={() => setType(id)} />
                  <span className="block text-2xl">{icon}</span>
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl bg-char p-5">
            <h2 className="font-extrabold">{t('yourInfo')}</h2>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-smoke">{t('name')}</label>
              <input id="name" autoComplete="name" value={form.name} onChange={set('name')} className={input(errors.name)} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{t('required')}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm text-smoke">{t('phone')}</label>
              <div className="flex gap-2" dir="ltr">
                <span className="flex items-center gap-1.5 rounded-xl border border-ash bg-coal px-3 font-bold"><Flag code={market} /> {marketInfo.phonePrefix}</span>
                <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={set('phone')} placeholder={marketInfo.phonePlaceholder} className={input(errors.phone)} />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-400">{t('required')}</p>}
            </div>
            {type === 'delivery' && (
              <div>
                <label htmlFor="address" className="mb-1 block text-sm text-smoke">{t('address')} · {L(marketInfo.city)}</label>
                <textarea id="address" rows={2} autoComplete="street-address" value={form.address} onChange={set('address')} placeholder={t('addressPh')} className={input(errors.address)} />
                {errors.address && <p className="mt-1 text-xs text-red-400">{t('required')}</p>}
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-char p-5">
            <h2 className="mb-3 font-extrabold">{t('payment')}</h2>
            <div className="space-y-2">
              {marketInfo.payments.map((p) => (
                <label key={p.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition ${validPayment === p.id ? 'border-ember bg-ember/10' : 'border-ash hover:border-smoke'}`}>
                  <input type="radio" name="pay" checked={validPayment === p.id} onChange={() => setPayment(p.id)} className="h-5 w-5 accent-[#ff5a1f]" />
                  <span className="flex-1">
                    <span className="block font-bold">{L(p.name)}</span>
                    <span className="block text-xs text-smoke">
                      {L(p.hint)}
                      {p.id === 'tabby' && ` · ${price(Math.ceil(((subtotal + fee) / 4) * 100) / 100)} × 4`}
                    </span>
                  </span>
                  <PayBadge id={p.id} />
                </label>
              ))}
            </div>
            {validPayment !== 'cod' && <p className="mt-3 text-xs text-smoke">🔒 {t('gatewayNote')}</p>}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl bg-char p-5 lg:sticky lg:top-24">
          <h2 className="font-extrabold">{t('orderSummary')}</h2>
          <ul className="space-y-3">
            {cartLines.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <FoodArt art={l.item.art} className="h-12 w-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{l.qty}× {L(l.item.name)}</p>
                  {optionsLabel(l, L, l.item) && <p className="truncate text-xs text-smoke">{optionsLabel(l, L, l.item)}</p>}
                </div>
                <span className="text-sm font-bold">{price(l.total)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-ash pt-3 text-sm">
            <div className="flex justify-between"><span className="text-smoke">{t('subtotal')}</span><span>{price(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-smoke">{t('delivery')}</span><span className={fee === 0 ? 'font-bold text-leaf' : ''}>{fee === 0 ? t('free') : price(fee)}</span></div>
            <div className="flex justify-between pt-1 text-xl font-extrabold"><span>{t('total')}</span><span className="text-mustard">{price(subtotal + fee)}</span></div>
            <p className="pt-1 text-xs text-smoke">{L(marketInfo.taxNote)}</p>
          </div>
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ember py-4 font-extrabold text-white shadow-lg shadow-ember/30 hover:bg-ember-dark disabled:opacity-70">
            {busy ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> {t('processing')}</>) : `${t('placeOrder')} · ${price(subtotal + fee)}`}
          </button>
          <p className="text-center text-xs text-smoke">🧪 {t('demoBanner')}</p>
        </aside>
      </form>
    </div>
  )
}
