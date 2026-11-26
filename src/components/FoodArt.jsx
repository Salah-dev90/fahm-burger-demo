// Flat, bold food illustrations drawn in code, in the FAHM palette.
// No stock photos, so no licensing issues.

const BUN = {
  default: { top: '#e9a04a', shade: '#c9782c', bottom: '#d98b3a' },
  brioche: { top: '#f0b252', shade: '#cf8530', bottom: '#e09a40' },
  charcoal: { top: '#2e2622', shade: '#1a1512', bottom: '#2a221d' },
}

function Sesame({ dark }) {
  const pts = [[70, 38], [88, 30], [106, 27], [124, 30], [140, 38], [80, 50], [98, 44], [116, 44], [132, 50], [62, 52], [148, 52]]
  return pts.map(([x, y], i) => (
    <ellipse key={i} cx={x} cy={y} rx="3.2" ry="1.7" fill={dark ? '#8a7b70' : '#fff3d6'} transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} />
  ))
}

function Burger({ patties = 1, cheese, cheeseColor = '#ffc23d', lettuce, lettuceColor = '#6cc04a', tomato, onion, pickles, mushroom, jalapeno, chicken, bun = 'default', sauce }) {
  const b = BUN[bun] ?? BUN.default
  // build layers bottom-up; y is the top edge of each layer
  let y = 128
  const layers = []
  // bottom bun
  layers.push(<path key="bb" d={`M42 ${y - 14} h116 a6 6 0 0 1 6 6 v4 a14 14 0 0 1 -14 14 h-106 a14 14 0 0 1 -14 -14 v-4 a6 6 0 0 1 6 -6z`} fill={b.bottom} />)
  y -= 14
  if (sauce) {
    layers.push(<path key="sc" d={`M44 ${y} q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 12 0`} stroke={sauce} strokeWidth="5" fill="none" strokeLinecap="round" />)
  }
  if (lettuce) {
    layers.push(<path key="lt" d={`M36 ${y + 1} q8 -10 16 -2 q8 -10 16 -2 q8 -10 16 -2 q8 -10 16 -2 q8 -10 16 -2 q8 -10 16 -2 q8 -10 16 -2 q6 -6 12 2 l-2 4 h-124z`} fill={lettuceColor} />)
    y -= 7
  }
  for (let i = 0; i < patties; i++) {
    const h = chicken ? 18 : 16
    if (chicken) {
      layers.push(
        <g key={`p${i}`}>
          <path d={`M38 ${y} q6 -${h} 20 -${h} h84 q14 0 20 ${h} q-4 4 -10 2 q-6 5 -14 1 q-8 5 -16 0 q-8 5 -16 0 q-8 5 -16 0 q-8 5 -16 0 q-8 5 -14 -1 q-6 3 -12 -1z`} fill="#d9902e" />
          <path d={`M54 ${y - h + 5} l6 3 M78 ${y - h + 4} l5 4 M104 ${y - h + 5} l6 2 M130 ${y - h + 4} l5 4`} stroke="#b06a1c" strokeWidth="3" strokeLinecap="round" />
        </g>,
      )
    } else {
      layers.push(
        <g key={`p${i}`}>
          <rect x="38" y={y - h} width="124" height={h} rx="8" fill="#4a2a1a" />
          <path d={`M50 ${y - h + 4} h20 M82 ${y - h + 4} h26 M120 ${y - h + 4} h28 M58 ${y - 5} h30 M100 ${y - 5} h34`} stroke="#2b160c" strokeWidth="2.5" strokeLinecap="round" />
        </g>,
      )
    }
    y -= h
    if (cheese) {
      layers.push(<path key={`c${i}`} d={`M40 ${y} h120 l-6 4 l-8 12 l-6 -12 l-30 0 l-7 15 l-7 -15 l-30 0 l-6 9 l-6 -9 l-14 0z`} fill={cheeseColor} />)
      y -= 3
    }
  }
  if (mushroom) {
    layers.push(
      <g key="mu">
        {[60, 86, 112, 138].map((x) => (
          <path key={x} d={`M${x - 11} ${y} a11 8 0 0 1 22 0z`} fill="#a67b5b" stroke="#7d573c" strokeWidth="1.5" />
        ))}
      </g>,
    )
    y -= 7
  }
  if (onion) {
    layers.push(
      <g key="on">
        {[58, 84, 110, 136].map((x) => (
          <ellipse key={x} cx={x} cy={y - 2} rx="12" ry="3.5" fill="none" stroke="#c79bd6" strokeWidth="3" />
        ))}
      </g>,
    )
    y -= 4
  }
  if (tomato) {
    layers.push(<rect key="tm" x="44" y={y - 7} width="112" height="8" rx="4" fill="#e8402a" />)
    y -= 7
  }
  if (pickles || jalapeno) {
    layers.push(
      <g key="pk">
        {[62, 90, 118, 144].map((x) => (
          <ellipse key={x} cx={x} cy={y - 2} rx="9" ry="4" fill={jalapeno ? '#3e9b35' : '#8fb33a'} stroke={jalapeno ? '#2a6e24' : '#6b8a25'} strokeWidth="1.5" />
        ))}
      </g>,
    )
    y -= 4
  }
  // top bun
  const top = y - 2
  layers.push(
    <g key="tb">
      <path d={`M36 ${top} q0 -44 64 -44 q64 0 64 44 q0 6 -8 6 h-112 q-8 0 -8 -6z`} fill={b.top} />
      <path d={`M46 ${top - 4} q4 -20 24 -30`} stroke={b.shade} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".35" />
      <g transform={`translate(0 ${top - 64})`}>
        <Sesame dark={bun === 'charcoal'} />
      </g>
    </g>,
  )
  return <g>{layers}</g>
}

function Fries({ cheese }) {
  const sticks = [62, 74, 86, 98, 110, 122, 134]
  return (
    <g>
      {sticks.map((x, i) => (
        <rect key={x} x={x} y={28 + ((i * 13) % 22)} width="11" height="70" rx="3" fill="#ffc23d" stroke="#e5a21e" strokeWidth="1.5" transform={`rotate(${(i - 3) * 4} ${x} 100)`} />
      ))}
      {cheese && <path d="M58 62 q14 -10 26 0 q12 -10 26 0 q12 -10 26 0 q8 -6 14 2 l-4 14 h-86z" fill="#ffb020" />}
      <path d="M52 70 h96 l-10 66 h-76z" fill="#ff5a1f" />
      <path d="M52 70 h96 l-2 12 h-92z" fill="#e04410" />
      <path d="M86 100 c0 -10 14 -10 14 -18 c4 8 6 12 6 18 a10 10 0 0 1 -20 0z" fill="#fff5e8" opacity=".9" />
    </g>
  )
}

function Rings() {
  return (
    <g>
      <ellipse cx="100" cy="124" rx="70" ry="12" fill="#2a221d" />
      {[[74, 96], [124, 98], [98, 74], [100, 110]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="24" fill="none" stroke="#d9902e" strokeWidth="13" />
          <circle cx={x} cy={y} r="24" fill="none" stroke="#f0b252" strokeWidth="5" strokeDasharray="6 7" />
        </g>
      ))}
    </g>
  )
}

function Nuggets() {
  const pts = [[66, 96], [100, 88], [134, 98], [82, 116], [118, 118], [100, 64]]
  return (
    <g>
      <ellipse cx="100" cy="128" rx="72" ry="12" fill="#2a221d" />
      {pts.map(([x, y], i) => (
        <path key={i} d={`M${x - 20} ${y} q-2 -14 14 -16 q14 -4 22 6 q10 8 2 20 q-8 10 -22 6 q-14 -2 -16 -16z`} fill="#d9902e" stroke="#b06a1c" strokeWidth="2" />
      ))}
      <ellipse cx="160" cy="70" rx="18" ry="8" fill="#ffc23d" />
      <path d="M142 70 v14 a18 8 0 0 0 36 0 v-14" fill="#ff5a1f" />
    </g>
  )
}

function Drink({ color }) {
  return (
    <g>
      <rect x="112" y="6" width="8" height="52" rx="3" fill="#ff5a1f" transform="rotate(12 116 30)" />
      <path d="M64 40 h72 l-8 100 h-56z" fill="#fff5e8" />
      <path d="M68 58 h64 l-6 78 h-52z" fill={color} />
      <rect x="58" y="32" width="84" height="12" rx="6" fill="#fff5e8" stroke="#e8dccb" strokeWidth="2" />
      <path d="M84 84 c0 -8 10 -8 10 -14 c3 6 4 9 4 14 a7 7 0 0 1 -14 0z" fill="#ff5a1f" />
      <circle cx="82" cy="110" r="4" fill="#fff" opacity=".35" />
      <circle cx="112" cy="96" r="3" fill="#fff" opacity=".35" />
    </g>
  )
}

function Shake() {
  return (
    <g>
      <rect x="110" y="0" width="8" height="54" rx="3" fill="#ff5a1f" transform="rotate(14 114 28)" />
      <path d="M62 40 q4 -22 22 -18 q8 -14 24 -6 q18 -6 24 14 q10 6 4 14 h-70 q-10 -2 -4 -4z" fill="#fff5e8" />
      <circle cx="108" cy="18" r="7" fill="#e8402a" />
      <path d="M64 46 h72 l-10 92 h-52z" fill="#c98c4a" />
      <path d="M64 46 h72 l-2 12 h-68z" fill="#b5763a" />
      <path d="M74 80 h52 M76 104 h48" stroke="#a5652c" strokeWidth="4" strokeLinecap="round" opacity=".6" />
    </g>
  )
}

function Brownie() {
  return (
    <g>
      <ellipse cx="100" cy="128" rx="74" ry="12" fill="#2a221d" />
      <path d="M50 74 l50 -20 l52 20 v42 l-52 18 l-50 -18z" fill="#4a2a1a" />
      <path d="M50 74 l50 -20 l52 20 l-52 20z" fill="#5e3622" />
      <path d="M100 94 v40" stroke="#2b160c" strokeWidth="2" />
      <path d="M58 76 q10 8 18 2 q10 10 22 4 q12 8 22 0 q10 6 22 -4" stroke="#ffc23d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M80 70 l4 -3 M110 66 l3 4 M126 74 l-4 2" stroke="#fff5e8" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

export default function FoodArt({ art, className = '' }) {
  const { kind, ...rest } = art
  let body
  switch (kind) {
    case 'burger': body = <Burger {...rest} />; break
    case 'fries': body = <Fries {...rest} />; break
    case 'rings': body = <Rings />; break
    case 'nuggets': body = <Nuggets />; break
    case 'drink': body = <Drink {...rest} />; break
    case 'shake': body = <Shake />; break
    case 'brownie': body = <Brownie />; break
    default: body = null
  }
  return (
    <svg viewBox="0 0 200 150" className={className} role="img" aria-hidden="true">
      <ellipse cx="100" cy="140" rx="70" ry="7" fill="#000" opacity=".25" />
      {body}
    </svg>
  )
}
