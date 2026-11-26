import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './index.css'
import { StoreProvider } from './store'
import StoreLayout from './pages/StoreLayout'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Track from './pages/Track'
import Admin from './pages/Admin'

function ScrollTop() {
  const { pathname } = useLocation()
  // block body: newer browsers return a Promise from scrollTo, which React rejects as a cleanup
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <ScrollTop />
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id" element={<Track />} />
          </Route>
          <Route path="admin" element={<Admin />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
)
