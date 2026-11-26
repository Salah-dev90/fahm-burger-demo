import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { STATUS_FLOW } from '../i18n'
import { MARKETS, formatPrice } from '../data/markets'
import FoodArt from '../components/FoodArt'
import { Flame } from '../components/ui'

export default function Track() {
  const { id } = useParams()
  const { t, L, lang, orders, findItem } = useStore()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-4 text-xl font-bold">{t('orderNotFound')}</p>
        <Link to="/" className="font-bold text-ember">{t('backToMenu')}</Link>
      </div>
    )
  }

  // the order keeps the currency it was placed in
  const p = (n) => formatPrice(n, order.market, lang)
  const flow = STATUS_FLOW[order.type]
  const idx = flow.indexOf(order.status)
  const cancelled = order.status === 'cancelled'
  const pay = MARKETS[order.market].payments.find((x) => x.id === order.payment)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="animate-rise text-center">
        <div className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full ${cancelled ? 'bg-red-500/20' : 'bg-ember/15 pulse-ring'}`}>
          {cancelled ? <span className="text-4xl">✕</span> : order.status === 'delivered' ? <span className="text-4xl">✓</span> : <Flame className="h-10 w-10 animate-flicker" />}
        </div>
        <h1 className="font-display text-4xl">{order.status === 'new' ? t('orderPlaced') : t(`status_${order.status}`)}</h1>
        <p className="mt-2 text-smoke">{t(`statusDesc_${order.status}`)}</p>
        <p className="mt-3 inline-block rounded-full bg-char px-4 py-1.5 font-bold">
          {t('orderNo')} <span className="text-mustard" dir="ltr">#{order.id}</span>
        </p>
      </div>

      {!cancelled && (
        <ol className="mt-10 flex items-start justify-between gap-1" aria-label={t('status')}>
          {flow.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
              <div className="flex w-full items-center">
                <div className={`h-1 flex-1 rounded-full ${i === 0 ? 'opacity-0' : i <= idx ? 'bg-ember' : 'bg-ash'}`} />
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold transition ${i < idx ? 'bg-ember text-white' : i === idx ? 'bg-ember text-white ring-4 ring-ember/30' : 'bg-ash text-smoke'}`}>
                  {i < idx ? '✓' : i + 1}
                </div>
                <div className={`h-1 flex-1 rounded-full ${i === flow.length - 1 ? 'opacity-0' : i < idx ? 'bg-ember' : 'bg-ash'}`} />
              </div>
              <span className={`text-xs font-bold sm:text-sm ${i <= idx ? 'text-cream' : 'text-smoke'}`}>{t(`status_${s}`)}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 rounded-3xl bg-char p-5">
        <ul className="space-y-3">
          {order.items.map((it, i) => {
            const item = findItem(it.id)
            return (
              <li key={i} className="flex items-center gap-3">
                <FoodArt art={item.art} className="h-12 w-14 shrink-0" />
                <span className="flex-1 font-bold">{it.qty}× {L(item.name)}</span>
                <span className="font-bold">{p(it.unit * it.qty)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 space-y-1 border-t border-ash pt-3 text-sm">
          <div className="flex justify-between"><span className="text-smoke">{t('delivery')}</span><span>{order.delivery === 0 ? t('free') : p(order.delivery)}</span></div>
          <div className="flex justify-between"><span className="text-smoke">{t('paidVia')}</span><span>{L(pay?.name)}</span></div>
          <div className="flex justify-between pt-1 text-lg font-extrabold"><span>{t('total')}</span><span className="text-mustard">{p(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-mustard/50 bg-mustard/5 p-4 text-center text-sm">
        <p className="mb-3">💡 {t('trackTip')}</p>
        <a href="#/admin" target="_blank" rel="noopener" className="inline-block rounded-full bg-mustard px-5 py-2 font-extrabold text-coal hover:brightness-110">
          {t('openAdmin')} ↗
        </a>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="font-bold text-ember hover:underline">{t('backToMenu')}</Link>
      </div>
    </div>
  )
}
