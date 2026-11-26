import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import FoodArt from './FoodArt'
import { Qty } from './ui'

export function optionsLabel(line, L, item) {
  const o = item.options
  if (!o) return ''
  const parts = []
  if (line.opts.size && o.sizes) parts.push(L(o.sizes.find((s) => s.id === line.opts.size)?.name))
  if (line.opts.combo && o.combo) parts.push(L({ ar: 'وجبة', en: 'Meal' }))
  for (const id of line.opts.extras ?? []) parts.push(L(o.extras?.find((e) => e.id === id)?.name))
  if (line.opts.notes) parts.push(`“${line.opts.notes}”`)
  return parts.filter(Boolean).join(' · ')
}

export default function CartDrawer({ open, onClose }) {
  const { t, L, price, cartLines, subtotal, deliveryFee, setQty, marketInfo, lang } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const remaining = marketInfo.freeDeliveryOver - subtotal

  const whatsapp = () => {
    const lines = cartLines.map((l) => `• ${l.qty}× ${L(l.item.name)}${optionsLabel(l, L, l.item) ? ` (${optionsLabel(l, L, l.item)})` : ''} = ${price(l.total)}`)
    const msg = [lang === 'ar' ? 'أهلاً فحم 👋 عايز أطلب:' : 'Hi FAHM 👋 I would like to order:', '', ...lines, '', `${t('total')}: ${price(subtotal + deliveryFee)}`].join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={t('cart')}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="animate-drawer absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-char shadow-2xl">
        <header className="flex items-center justify-between border-b border-ash p-5">
          <h2 className="font-display text-2xl">{t('cart')}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-ash hover:bg-ember" aria-label="close">✕</button>
        </header>

        {cartLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <FoodArt art={{ kind: 'burger', cheese: true, lettuce: true }} className="h-32 opacity-40 grayscale" />
            <p className="font-bold text-lg">{t('cartEmpty')}</p>
            <p className="text-smoke">{t('cartEmptySub')}</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {cartLines.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-2xl bg-coal p-3">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-char">
                    <FoodArt art={l.item.art} className="h-16 w-auto" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="font-bold leading-tight">{L(l.item.name)}</p>
                      {optionsLabel(l, L, l.item) && <p className="truncate text-xs text-smoke">{optionsLabel(l, L, l.item)}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-mustard">{price(l.total)}</span>
                      <Qty small value={l.qty} onChange={(v) => setQty(l.key, v)} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-ash p-5">
              {remaining > 0 && (
                <div>
                  <p className="mb-1.5 text-sm text-smoke">🛵 {t('addMoreForFree', { x: price(remaining) })}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ash">
                    <div className="h-full rounded-full bg-gradient-to-r from-mustard to-ember transition-all" style={{ width: `${Math.min(100, (subtotal / marketInfo.freeDeliveryOver) * 100)}%` }} />
                  </div>
                </div>
              )}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-smoke">{t('subtotal')}</span><span>{price(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-smoke">{t('delivery')}</span><span className={deliveryFee === 0 ? 'text-leaf font-bold' : ''}>{deliveryFee === 0 ? t('free') : price(deliveryFee)}</span></div>
                <div className="flex justify-between pt-1 text-lg font-extrabold"><span>{t('total')}</span><span>{price(subtotal + deliveryFee)}</span></div>
              </div>
              <button
                onClick={() => { onClose(); navigate('/checkout') }}
                className="w-full rounded-full bg-ember py-3.5 font-extrabold text-white shadow-lg shadow-ember/30 hover:bg-ember-dark"
              >
                {t('checkout')}
              </button>
              <button onClick={whatsapp} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#25d366] py-3 font-bold text-[#25d366] hover:bg-[#25d366]/10">
                <WaIcon /> {t('orderWhatsapp')}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export function WaIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  )
}
