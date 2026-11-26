import { Link } from 'react-router-dom'
import { useStore } from '../store'

export function Flame({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 4c7 10 16 16 16 30a16 16 0 0 1-32 0c0-8 4-13 8-17 1 6 4 8 7 9-2-8-1-15 1-22z" fill="#ff5a1f" />
      <path d="M32 30c3 4 7 7 7 13a7 7 0 0 1-14 0c0-4 2-6 4-8 0 3 2 4 3 4-1-3 0-6 0-9z" fill="#ffc23d" />
    </svg>
  )
}

export function Logo({ to = '/', small }) {
  const { lang } = useStore()
  return (
    <Link to={to} className="flex items-center gap-2 select-none" aria-label="FAHM">
      <Flame className={small ? 'h-7 w-7' : 'h-9 w-9 animate-flicker'} />
      <span className={`font-display leading-none ${small ? 'text-2xl' : 'text-3xl'} text-cream`}>
        {lang === 'ar' ? 'فحم' : 'FAHM'}
      </span>
    </Link>
  )
}

export function DemoBanner() {
  const { t } = useStore()
  return (
    <div className="bg-mustard text-coal text-xs sm:text-sm font-bold text-center px-4 py-1.5">
      🧪 {t('demoBanner')}
    </div>
  )
}

export function Toggles({ compact }) {
  const { lang, setLang, market, setMarket, t } = useStore()
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full bg-char p-0.5 text-sm font-bold" role="group" aria-label={t('market')}>
        {['SA', 'EG'].map((m) => (
          <button
            key={m}
            onClick={() => setMarket(m)}
            className={`rounded-full px-2.5 py-1 transition ${market === m ? 'bg-ember text-white' : 'text-smoke hover:text-cream'}`}
            aria-pressed={market === m}
          >
            <span className="flex items-center gap-1.5">
              <Flag code={m} />
              {!compact && m}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="rounded-full border border-ash px-3 py-1 text-sm font-bold text-cream hover:border-ember"
      >
        {t('language')}
      </button>
    </div>
  )
}

// Simplified flags as SVG: Windows does not render flag emoji.
export function Flag({ code, className = 'h-3 w-[18px] rounded-[2px]' }) {
  if (code === 'SA')
    return (
      <svg viewBox="0 0 18 12" className={className} aria-hidden="true">
        <rect width="18" height="12" fill="#006c35" />
        <path d="M5 5h8M5 6.2h7" stroke="#fff" strokeWidth=".7" />
        <path d="M5 8.4h8" stroke="#fff" strokeWidth=".6" />
      </svg>
    )
  return (
    <svg viewBox="0 0 18 12" className={className} aria-hidden="true">
      <rect width="18" height="4" fill="#ce1126" />
      <rect y="4" width="18" height="4" fill="#fff" />
      <rect y="8" width="18" height="4" fill="#000" />
      <circle cx="9" cy="6" r="1.2" fill="#c09300" />
    </svg>
  )
}

export function Qty({ value, onChange, small }) {
  const btn = `grid place-items-center rounded-full bg-ash text-cream hover:bg-ember transition font-bold ${small ? 'h-7 w-7' : 'h-9 w-9 text-lg'}`
  return (
    <div className="flex items-center gap-2">
      <button className={btn} onClick={() => onChange(value - 1)} aria-label="-">−</button>
      <span className={`min-w-6 text-center font-bold ${small ? '' : 'text-lg'}`}>{value}</span>
      <button className={btn} onClick={() => onChange(value + 1)} aria-label="+">+</button>
    </div>
  )
}

export function StatusPill({ status }) {
  const { t } = useStore()
  const styles = {
    new: 'bg-mustard/15 text-mustard',
    preparing: 'bg-ember/15 text-ember',
    ready: 'bg-sky-400/15 text-sky-300',
    out: 'bg-sky-400/15 text-sky-300',
    delivered: 'bg-leaf/15 text-leaf',
    cancelled: 'bg-red-500/15 text-red-400',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status]}`}>{t(`status_${status}`)}</span>
}
