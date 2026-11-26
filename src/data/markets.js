export const MARKETS = {
  SA: {
    code: 'SA',
    flag: '🇸🇦',
    currency: { ar: 'ر.س', en: 'SAR' },
    deliveryFee: 12,
    freeDeliveryOver: 120,
    city: { ar: 'الرياض', en: 'Riyadh' },
    phonePrefix: '+966',
    phonePlaceholder: '5X XXX XXXX',
    taxNote: { ar: 'الأسعار شاملة ضريبة القيمة المضافة 15%', en: 'Prices include 15% VAT' },
    payments: [
      { id: 'mada', name: { ar: 'مدى', en: 'mada' }, hint: { ar: 'بطاقة مدى البنكية', en: 'mada debit card' }, badge: 'mada' },
      { id: 'applepay', name: { ar: 'Apple Pay', en: 'Apple Pay' }, hint: { ar: 'ادفع بلمسة', en: 'Pay with one touch' }, badge: '' },
      { id: 'tabby', name: { ar: 'تابي', en: 'Tabby' }, hint: { ar: 'قسّمها على 4 دفعات بدون فوائد', en: 'Split in 4, interest-free' }, badge: 'tabby' },
      { id: 'stcpay', name: { ar: 'STC Pay', en: 'STC Pay' }, hint: { ar: 'محفظة STC Pay', en: 'STC Pay wallet' }, badge: 'stc' },
      { id: 'cod', name: { ar: 'كاش عند الاستلام', en: 'Cash on delivery' }, hint: { ar: 'ادفع للمندوب', en: 'Pay the driver' }, badge: '' },
    ],
  },
  EG: {
    code: 'EG',
    flag: '🇪🇬',
    currency: { ar: 'ج.م', en: 'EGP' },
    deliveryFee: 35,
    freeDeliveryOver: 700,
    city: { ar: 'القاهرة', en: 'Cairo' },
    phonePrefix: '+20',
    phonePlaceholder: '1X XXXX XXXX',
    taxNote: { ar: 'الأسعار شاملة ضريبة القيمة المضافة 14%', en: 'Prices include 14% VAT' },
    payments: [
      { id: 'card', name: { ar: 'بطاقة بنكية', en: 'Card' }, hint: { ar: 'فيزا / ماستركارد / ميزة عبر Paymob', en: 'Visa / Mastercard / Meeza via Paymob' }, badge: '' },
      { id: 'instapay', name: { ar: 'InstaPay', en: 'InstaPay' }, hint: { ar: 'تحويل فوري من حسابك', en: 'Instant bank transfer' }, badge: '' },
      { id: 'fawry', name: { ar: 'فوري', en: 'Fawry' }, hint: { ar: 'ادفع بكود من أي منفذ فوري', en: 'Pay with a code at any Fawry outlet' }, badge: '' },
      { id: 'cod', name: { ar: 'كاش عند الاستلام', en: 'Cash on delivery' }, hint: { ar: 'ادفع للطيار', en: 'Pay the courier' }, badge: '' },
    ],
  },
}

export function formatPrice(amount, market, lang) {
  const m = MARKETS[market]
  const n = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount)
  return lang === 'ar' ? `${n} ${m.currency.ar}` : `${m.currency.en} ${n}`
}
