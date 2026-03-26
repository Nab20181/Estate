import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const CONDITION_MULT = { Mint: 1.2, Excellent: 1.0, Good: 0.8, Fair: 0.55, Poor: 0.35 };
const CONDITIONS = Object.keys(CONDITION_MULT);
const RARITY_STYLE = {
  Common:         'bg-slate-100 text-slate-500',
  Uncommon:       'bg-green-50 text-green-700',
  Rare:           'bg-blue-50 text-blue-700',
  'Very Rare':    'bg-purple-50 text-purple-700',
  'Extremely Rare':'bg-amber-50 text-amber-700',
};
const TABS = [
  { id: 'home',  label: 'Home',  icon: HomeIcon },
  { id: 'scan',  label: 'Scan',  icon: null },
  { id: 'rooms', label: 'Rooms', icon: RoomsIcon },
];

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function RoomsIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
function AccountIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function EmptyHouse() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 44L48 12L84 44" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 36V80H76V36" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36 80V56H60V80" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36 40H44V48H36V40Z" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
      <path d="M52 40H60V48H52V40Z" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${
            value === opt ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CopyBox({ label, text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</span>
        <button
          onClick={copy}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors ${
            copied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {copied ? (
            <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Copied</>
          ) : (
            <><CopyIcon /> Copy</>
          )}
        </button>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-line">{text}</div>
    </div>
  );
}

function ItemCard({ item, selected, onSelect, onRemove, onConditionChange, onAddPhotos, index }) {
  const [expanded, setExpanded] = useState(false);
  const adjPrice = Math.round((item.estimatedValue?.best || 0) * (CONDITION_MULT[item.condition] || 1));

  return (
    <div
      className="card-enter bg-white rounded-2xl overflow-hidden border border-slate-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', animationDelay: `${index * 60}ms` }}
    >
      {/* Photo */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
        {/* Select checkbox */}
        <button
          onClick={() => onSelect(item.id)}
          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-[#0284c7] border-[#0284c7]' : 'bg-white/80 border-slate-300'
          }`}
        >
          {selected && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        </button>
        {/* Rarity badge */}
        {item.rarity && item.rarity !== 'Common' && (
          <span className={`absolute top-2.5 left-2.5 text-xs px-2 py-0.5 rounded-full font-medium ${RARITY_STYLE[item.rarity] || ''}`}>
            {item.rarity}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {item.error ? (
          <p className="text-red-500 text-sm">{item.error}</p>
        ) : (
          <>
            {/* Category + Name + Price */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-0.5">{item.category}</p>
                <p className="font-semibold text-slate-800 text-sm leading-snug">{item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-serif text-lg font-bold text-[#0284c7]">${adjPrice}</p>
                <p className="text-xs text-slate-400">${item.estimatedValue?.low}–${item.estimatedValue?.high}</p>
              </div>
            </div>

            {/* Condition */}
            <SegmentedControl options={CONDITIONS} value={item.condition} onChange={c => onConditionChange(item.id, c)} />

            {/* Name override */}
            <input
              type="text"
              defaultValue={item.name}
              onBlur={e => {/* handled via item.name update */}}
              placeholder="Correct item name if needed..."
              className="mt-2 w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:border-[#0284c7] transition"
            />

            {/* Details accordion */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-[#0284c7] font-medium flex items-center gap-1"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${expanded ? 'rotate-90' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            {expanded && (
              <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                {item.description && <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>}
                {(item.condition_notes || item.rarityNote || item.rarity_notes) && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Condition / Rarity Notes</p>
                    {item.condition_notes && <p className="text-xs text-slate-600 mb-1">{item.condition_notes}</p>}
                    {(item.rarity_notes || item.rarityNote) && <p className="text-xs text-slate-600">{item.rarity_notes || item.rarityNote}</p>}
                  </div>
                )}
                {item.recentSales && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Recent Sales</p>
                    <p className="text-xs text-slate-600">{item.recentSales}</p>
                  </div>
                )}
                {item.bestPlatform && (
                  <p className="text-xs text-slate-500 mt-2">Best on <span className="text-[#0284c7] font-medium">{item.bestPlatform}</span> — {item.bestPlatformReason}</p>
                )}
                {item.ebayTitle && <CopyBox label="eBay Title" text={item.ebayTitle} />}
                {item.listingDescription && <CopyBox label="Listing Description" text={item.listingDescription} />}
              </div>
            )}

            {/* Add photos */}
            <label className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0284c7] cursor-pointer transition-colors">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add photos
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => { onAddPhotos(item.id, e.target.files); e.target.value = ''; }} />
            </label>
          </>
        )}

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          className="mt-3 w-full text-center text-sm text-slate-400 hover:text-red-500 py-2 rounded-xl hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="sheet-open absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pt-3 pb-safe"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        {title && <p className="text-base font-semibold text-slate-800 px-6 mb-4">{title}</p>}
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function EstateApp() {
  const [tab, setTab] = useState('home');
  const [items, setItems] = useState(() => load('estate_items', []));
  const [rooms, setRooms] = useState(() => load('estate_rooms', ['Living Room', 'Kitchen', 'Bedroom', 'Attic', 'Garage']));
  const [activeRoom, setActiveRoom] = useState(() => load('estate_active_room', 'Living Room'));
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('estate_api_key') || '' : '');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [bundling, setBundling] = useState(false);
  const [sheet, setSheet] = useState(null); // 'account' | 'rooms' | 'bundle'
  const [newRoom, setNewRoom] = useState('');
  const fileRef = useRef();

  useEffect(() => { save('estate_items', items); }, [items]);
  useEffect(() => { save('estate_rooms', rooms); }, [rooms]);
  useEffect(() => { save('estate_active_room', activeRoom); }, [activeRoom]);

  const roomItems = items.filter(i => i.room === activeRoom);
  const selectedItems = items.filter(i => selected.includes(i.id));
  const totalValue = roomItems.reduce((s, i) => s + Math.round((i.estimatedValue?.best || 0) * (CONDITION_MULT[i.condition] || 1)), 0);

  const processFiles = useCallback(async (files) => {
    if (!files?.length) return;
    const key = apiKey || localStorage.getItem('estate_api_key');
    if (!key) { setError('Add your Claude API key in Account first.'); setSheet('account'); return; }
    setAnalyzing(true);
    setProgress(0);
    setError(null);
    setTab('home');
    const arr = Array.from(files);
    const results = [];
    for (let i = 0; i < arr.length; i++) {
      setProgress(Math.round(((i) / arr.length) * 90));
      try {
        const base64 = await resizeImage(arr[i]);
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType: 'image/jpeg', apiKey: key }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.blocked) throw new Error(`Blocked: ${data.reason}`);
        results.push({ id: Date.now() + i, preview: URL.createObjectURL(arr[i]), condition: data.condition || 'Good', room: activeRoom, ...data });
      } catch (err) {
        results.push({ id: Date.now() + i, preview: URL.createObjectURL(arr[i]), name: 'Failed', error: err.message, estimatedValue: { low:0, high:0, best:0 }, condition: 'Good', room: activeRoom });
      }
    }
    setProgress(100);
    setTimeout(() => { setProgress(0); setAnalyzing(false); }, 400);
    setItems(prev => [...prev, ...results]);
  }, [apiKey, activeRoom]);

  const makeBundle = async () => {
    if (selectedItems.length < 2) return;
    setBundling(true);
    const key = apiKey || localStorage.getItem('estate_api_key');
    const summary = selectedItems.map(i => `${i.name} (${i.condition}, $${Math.round((i.estimatedValue?.best||0)*(CONDITION_MULT[i.condition]||1))})`).join(', ');
    try {
      const res = await fetch('/api/bundle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: summary, apiKey: key }),
      });
      const data = await res.json();
      setBundle(data);
      setSheet('bundle');
    } catch (err) { setError(err.message); }
    setBundling(false);
  };

  const exportCSV = () => {
    const headers = ['Name','Category','Condition','Rarity','Low','Best','High','Adjusted','Platform','eBay Title','Room'];
    const rows = items.map(i => [i.name,i.category,i.condition,i.rarity,i.estimatedValue?.low,i.estimatedValue?.best,i.estimatedValue?.high,Math.round((i.estimatedValue?.best||0)*(CONDITION_MULT[i.condition]||1)),i.bestPlatform,i.ebayTitle,i.room]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='estate.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans select-none" style={{ fontFamily: "'DM Sans', Inter, system-ui, sans-serif" }}>

      {/* Progress bar */}
      {analyzing && progress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-slate-200">
          <div className="h-full bg-[#0284c7] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-slate-800 tracking-tight">
            est<span className="text-[#0284c7]">🏠</span>te
          </span>
          <div className="flex items-center gap-3">
            {roomItems.length > 0 && (
              <span className="font-serif text-lg font-bold text-[#0284c7]">${totalValue.toLocaleString()}</span>
            )}
            <button onClick={() => setTab('account')} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <AccountIcon active={tab === 'account'} />
            </button>
          </div>
        </div>
      </header>

      {/* Room pills */}
      <div className="sticky top-14 z-30 bg-white border-b border-slate-100 px-4 py-2">
        <div className="max-w-lg mx-auto flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {rooms.map(r => (
            <button
              key={r}
              onClick={() => setActiveRoom(r)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeRoom === r ? 'bg-[#0284c7] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >{r}</button>
          ))}
          <button
            onClick={() => setSheet('rooms')}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
          >+ Add</button>
        </div>
      </div>

      {/* Totals / selection bar */}
      {(roomItems.length > 0 || selected.length > 0) && (
        <div className="sticky top-[90px] z-20 bg-white border-b border-slate-100 px-4 py-2.5">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            {selected.length > 0 ? (
              <>
                <span className="text-sm text-slate-600">{selected.length} selected</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected([])} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                  <button
                    onClick={makeBundle}
                    disabled={bundling || selected.length < 2}
                    className="text-xs bg-[#0284c7] text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition"
                  >{bundling ? 'Bundling…' : `Bundle ${selected.length}`}</button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-400">{roomItems.length} item{roomItems.length !== 1 ? 's' : ''}</span>
                <div className="w-px h-4 bg-slate-200 mx-2" />
                <span className="font-serif font-bold text-[#0284c7] text-lg">${totalValue.toLocaleString()}</span>
                <div className="flex-1" />
                <button onClick={exportCSV} className="text-xs text-slate-400 hover:text-slate-600 transition">Export CSV</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
            {error}
            <button onClick={() => setError(null)} className="text-red-400 ml-2">✕</button>
          </div>
        )}

        {/* Scan tab */}
        {tab === 'scan' && (
          <div
            className="flex flex-col items-center justify-center min-h-[60vh] cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onChange={e => { processFiles(e.target.files); e.target.value = ''; }} />
            <div className={`w-20 h-20 rounded-full bg-[#0284c7] flex items-center justify-center mb-6 ${roomItems.length === 0 ? 'pulse-fab' : ''}`}
              style={{ boxShadow: '0 4px 14px rgba(2,132,199,0.4)' }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-1">Photograph items</p>
            <p className="text-sm text-slate-400">Tap to take photos, or drag photos here</p>
          </div>
        )}

        {/* Home tab */}
        {tab === 'home' && (
          <>
            {roomItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <EmptyHouse />
                <p className="mt-5 text-base font-medium text-slate-600">Nothing here yet</p>
                <p className="text-sm text-slate-400 mt-1 mb-6">Tap the blue button to photograph your first item</p>
                <button
                  onClick={() => setTab('scan')}
                  className={`w-16 h-16 rounded-full bg-[#0284c7] flex items-center justify-center pulse-fab`}
                  style={{ boxShadow: '0 4px 14px rgba(2,132,199,0.4)' }}
                >
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {roomItems.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    selected={selected.includes(item.id)}
                    onSelect={id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])}
                    onRemove={id => setItems(prev => prev.filter(i => i.id !== id))}
                    onConditionChange={(id, c) => setItems(prev => prev.map(i => i.id === id ? {...i, condition: c} : i))}
                    onAddPhotos={async (id, files) => {
                      const key = apiKey || localStorage.getItem('estate_api_key');
                      for (const file of Array.from(files)) {
                        const base64 = await resizeImage(file);
                        const res = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({image:base64,mediaType:'image/jpeg',apiKey:key}) });
                        const data = await res.json();
                        if (res.ok && !data.blocked) {
                          setItems(prev => prev.map(i => i.id === id ? {...i, description: data.description||i.description, rarityNote: data.rarityNote||i.rarityNote, recentSales: data.recentSales||i.recentSales} : i));
                        }
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Rooms tab */}
        {tab === 'rooms' && (
          <div className="space-y-2">
            {rooms.map(r => (
              <button
                key={r}
                onClick={() => { setActiveRoom(r); setTab('home'); }}
                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-200 text-left"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <span className={`font-medium text-sm ${activeRoom === r ? 'text-[#0284c7]' : 'text-slate-700'}`}>{r}</span>
                <span className="text-xs text-slate-400">{items.filter(i=>i.room===r).length} items</span>
              </button>
            ))}
            <button onClick={() => setSheet('rooms')} className="w-full py-3 text-sm text-[#0284c7] font-medium">+ Add room</button>
          </div>
        )}

        {/* Account tab */}
        {tab === 'account' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Claude API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); localStorage.setItem('estate_api_key', e.target.value); }}
                placeholder="sk-ant-..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#0284c7] font-mono transition"
              />
              <p className="text-xs text-slate-400 mt-2">Saved in your browser only. <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-[#0284c7]">Get a key →</a></p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">Inventory</p>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="flex-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl transition font-medium">Export CSV</button>
                <button onClick={() => { if (confirm('Clear all items?')) setItems([]); }} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-500 py-2.5 rounded-xl transition font-medium">Clear all</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom tab bar — Home | [FAB] | Rooms */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100" style={{ boxShadow: '0 -1px 3px rgba(0,0,0,0.06)' }}>
        <div className="max-w-lg mx-auto flex items-center h-16 px-8">
          {/* Home */}
          <button onClick={() => setTab('home')} className="flex flex-col items-center gap-0.5 flex-1 py-1">
            <HomeIcon active={tab === 'home'} />
            <span className={`text-[10px] font-medium ${tab === 'home' ? 'text-[#0284c7]' : 'text-slate-400'}`}>Home</span>
          </button>
          {/* FAB — scan */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => { fileRef.current?.click(); }}
              className={`-mt-5 w-14 h-14 rounded-full bg-[#0284c7] flex items-center justify-center active:scale-95 transition-transform ${items.length === 0 ? 'pulse-fab' : ''}`}
              style={{ boxShadow: '0 4px 14px rgba(2,132,199,0.5)' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          {/* Rooms */}
          <button onClick={() => setTab('rooms')} className="flex flex-col items-center gap-0.5 flex-1 py-1">
            <RoomsIcon active={tab === 'rooms'} />
            <span className={`text-[10px] font-medium ${tab === 'rooms' ? 'text-[#0284c7]' : 'text-slate-400'}`}>Rooms</span>
          </button>
        </div>
      </div>

      {/* Bundle sheet */}
      <BottomSheet open={sheet === 'bundle'} onClose={() => setSheet(null)} title="Bundle Pricing">
        {bundle && (
          <div className="space-y-4">
            <div className="flex gap-6">
              <div><p className="text-xs text-slate-400 mb-1">Individual</p><p className="font-serif text-xl font-bold text-slate-500">${bundle.individualTotal}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Bundle</p><p className="font-serif text-xl font-bold text-[#0284c7]">${bundle.bundlePrice}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Saving</p><p className="font-serif text-xl font-bold text-green-600">{bundle.discountPercent}%</p></div>
            </div>
            <p className="text-sm text-slate-500">{bundle.rationale}</p>
            <CopyBox label="Bundle Listing" text={bundle.description} />
          </div>
        )}
      </BottomSheet>

      {/* Rooms sheet */}
      <BottomSheet open={sheet === 'rooms'} onClose={() => setSheet(null)} title="Add Room">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRoom}
            onChange={e => setNewRoom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newRoom.trim()) { setRooms(prev => [...prev, newRoom.trim()]); setNewRoom(''); setSheet(null); }}}
            placeholder="Room name..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0284c7]"
            autoFocus
          />
          <button
            onClick={() => { if (newRoom.trim()) { setRooms(prev => [...prev, newRoom.trim()]); setNewRoom(''); setSheet(null); }}}
            className="bg-[#0284c7] text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          >Add</button>
        </div>
      </BottomSheet>

      {/* Account sheet */}
      <BottomSheet open={sheet === 'account'} onClose={() => setSheet(null)} title="API Key Required">
        <p className="text-sm text-slate-500 mb-4">Enter your Claude API key to analyze photos.</p>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); localStorage.setItem('estate_api_key', e.target.value); }}
          placeholder="sk-ant-..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#0284c7] mb-3"
          autoFocus
        />
        <button onClick={() => setSheet(null)} className="w-full bg-[#0284c7] text-white py-3 rounded-xl text-sm font-semibold">Save & continue</button>
      </BottomSheet>

      {/* Hidden file input for bottom FAB */}
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
        onChange={e => { processFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
