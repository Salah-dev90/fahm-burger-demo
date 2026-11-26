import { useEffect, useState } from 'react'
import { useStore, unitPrice } from '../store'
import FoodArt from './FoodArt'
import { Qty } from './ui'

export default function ItemModal({ item, onClose }) {
  const { t, L, price, market, addToCart } = useStore()
  const o = item.options || {}
  const [size, setSize] = useState(o.sizes?.[0].id)
  const [extras, setExtras] = useState([])
  const [combo, setCombo] = useState(false)
  const [notes, setNotes] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const opts = { size, extras, combo, notes: notes.trim() || undefined }
  const unit = unitPrice(item, opts, market)
  const toggle = (id) => setExtras((x) => (x.includes(id) ? x.filter((e) => e !== id) : [...x, id]))

  const add = () => {
    addToCart(item.id, opts, qty)
    onClose(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={L(item.name)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onClose()} />
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-char animate-rise">
        <button onClick={() => onClose()} className="absolute top-3 end-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-coal/70 text-cream hover:bg-ember" aria-label="close">✕</button>
        <div className="ember-glow bg-coal px-10 pt-8 pb-2">
          <FoodArt art={item.art} className="mx-auto h-48 w-auto drop-shadow-2xl" />
        </div>
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="font-display text-3xl">{L(item.name)}</h2>
            <p className="mt-1 text-smoke leading-relaxed">{L(item.desc)}</p>
            <p className="mt-1 text-xs text-smoke">{item.calories} {t('cal')}</p>
          </div>

          {o.sizes && (
            <fieldset>
              <legend className="mb-2 font-bold">{t('size')}</legend>
              <div className="grid grid-cols-2 gap-2">
                {o.sizes.map((s) => (
                  <label key={s.id} className={`cursor-pointer rounded-xl border-2 p-3 text-center font-bold transition ${size === s.id ? 'border-ember bg-ember/10' : 'border-ash hover:border-smoke'}`}>
                    <input type="radio" name="size" className="sr-only" checked={size === s.id} onChange={() => setSize(s.id)} />
                    {L(s.name)}
                    {s.price[market] > 0 && <span className="block text-xs text-smoke">+{price(s.price[market])}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {o.combo && (
            <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 transition ${combo ? 'border-mustard bg-mustard/10' : 'border-ash'}`}>
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={combo} onChange={(e) => setCombo(e.target.checked)} className="h-5 w-5 accent-[#ffc23d]" />
                <span className="font-bold">🍟🥤 {L(o.combo.name)}</span>
              </span>
              <span className="text-sm font-bold text-mustard whitespace-nowrap">+{price(o.combo.price[market])}</span>
            </label>
          )}

          {o.extras && (
            <fieldset>
              <legend className="mb-2 font-bold">
                {t('extras')} <span className="text-xs font-normal text-smoke">({t('optional')})</span>
              </legend>
              <div className="space-y-1.5">
                {o.extras.map((e) => (
                  <label key={e.id} className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 hover:bg-ash/50">
                    <span className="flex items-center gap-3">
                      <input type="checkbox" checked={extras.includes(e.id)} onChange={() => toggle(e.id)} className="h-5 w-5 accent-[#ff5a1f]" />
                      {L(e.name)}
                    </span>
                    <span className="text-sm text-smoke">+{price(e.price[market])}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {item.options && (
            <div>
              <label htmlFor="notes" className="mb-2 block font-bold">{t('notes')}</label>
              <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notesPh')} className="w-full rounded-xl border border-ash bg-coal px-4 py-3 outline-none focus:border-ember" />
            </div>
          )}
        </div>
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-ash bg-char p-4">
          <Qty value={qty} onChange={(v) => setQty(Math.max(1, v))} />
          <button onClick={add} className="flex-1 rounded-full bg-ember py-3.5 font-extrabold text-white shadow-lg shadow-ember/30 transition hover:bg-ember-dark active:scale-[.98]">
            {t('addToCart')} · {price(unit * qty)}
          </button>
        </div>
      </div>
    </div>
  )
}
