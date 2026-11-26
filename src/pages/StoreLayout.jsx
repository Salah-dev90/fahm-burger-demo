import { createContext, useContext, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useStore } from '../store'
import { DemoBanner, Logo, Toggles } from '../components/ui'
import CartDrawer from '../components/CartDrawer'

const CartUI = createContext(null)
export const useCartUI = () => useContext(CartUI)

export default function StoreLayout() {
  const { t, cartCount, subtotal, deliveryFee, price } = useStore()
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(0)

  return (
    <CartUI.Provider value={{ openCart: () => setOpen(true), bump: () => setBump((b) => b + 1) }}>
      <DemoBanner />
      <header className="sticky top-0 z-30 border-b border-ash/60 bg-coal/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block"><Toggles /></div>
            <div className="sm:hidden"><Toggles compact /></div>
            <button
              key={bump}
              onClick={() => setOpen(true)}
              className={`relative grid h-11 w-11 place-items-center rounded-full bg-ember text-white shadow-lg shadow-ember/30 hover:bg-ember-dark ${bump ? 'animate-rise' : ''}`}
              aria-label={`${t('cart')} (${cartCount})`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 7h12l-1 13H7z" /><path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-mustard px-1 text-xs font-extrabold text-coal">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {cartCount > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full bg-ember px-6 py-4 font-extrabold text-white shadow-2xl shadow-ember/40 sm:hidden"
        >
          <span className="grid h-7 min-w-7 place-items-center rounded-full bg-white/20 px-2 text-sm">{cartCount}</span>
          <span>{t('cart')}</span>
          <span>{price(subtotal + deliveryFee)}</span>
        </button>
      )}

      <footer className="mt-16 border-t border-ash/60 px-4 py-10 pb-28 sm:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
          <div className="space-y-1">
            <Logo small />
            <p className="max-w-md text-sm text-smoke">{t('footer')}</p>
          </div>
          <Link to="/admin" className="rounded-full border border-ash px-4 py-2 text-sm font-bold hover:border-ember">
            ⚙️ {t('admin')}
          </Link>
        </div>
      </footer>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </CartUI.Provider>
  )
}
