import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITION_MULT = { Mint: 1.2, Excellent: 1.0, Good: 0.8, Fair: 0.55, Poor: 0.35 };
const CONDITIONS = Object.keys(CONDITION_MULT);
const RARITY_PILL = {
  Common:          null,
  Uncommon:        { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  Rare:            { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'Very Rare':     { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
  'Extremely Rare':{ bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
};

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
function Logo({ size = 'md' }) {
  const h = size === 'sm' ? 18 : 22;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width={h} height={h} viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="#0066FF" fillOpacity="0.12" stroke="#0066FF" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 21V15H15V21" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: size === 'sm' ? 17 : 21, color: '#0F172A', letterSpacing: '-0.5px' }}>estate</span>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = '#94A3B8', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resizeImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let [w, h] = [img.width, img.height];
        if (w > MAX || h > MAX) w > h ? (h = Math.round(h * MAX / w), w = MAX) : (w = Math.round(w * MAX / h), h = MAX);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
const ls = (k, fb) => { try { return JSON.parse(localStorage?.getItem(k)) ?? fb; } catch { return fb; } };
const ss = (k, v) => { try { localStorage?.setItem(k, JSON.stringify(v)); } catch {} };
const fmt = n => n ? `$${Number(n).toLocaleString()}` : '$0';
const adj = item => Math.round((item.estimatedValue?.best || 0) * (CONDITION_MULT[item.condition] || 1));

// ─── Components ───────────────────────────────────────────────────────────────
function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', padding: '12px 0 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', animation: 'sheetIn 0.26s cubic-bezier(0.32,0.72,0,1) forwards' }}
      >
        <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 9, margin: '0 auto 16px' }} />
        {title && <p style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: '#0F172A', padding: '0 20px 12px' }}>{title}</p>}
        <div style={{ padding: '0 20px' }}>{children}</div>
      </div>
    </div>
  );
}

function CopyBox({ label, text }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); };
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <button onClick={copy} style={{ fontSize: 11, color: ok ? '#16A34A' : '#64748B', background: ok ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${ok ? '#BBF7D0' : '#E2E8F0'}`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}>
          {ok ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#475569', fontFamily: 'ui-monospace, monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {text}
      </div>
    </div>
  );
}

function ConditionControl({ value, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 3, gap: 2 }}>
      {CONDITIONS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: '5px 2px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.12s', background: value === c ? '#fff' : 'transparent', color: value === c ? '#0066FF' : '#94A3B8', boxShadow: value === c ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
          {c}
        </button>
      ))}
    </div>
  );
}

function ItemCard({ item, selected, onSelect, onRemove, onConditionChange, onAddPhotos, index }) {
  const [open, setOpen] = useState(false);
  const price = adj(item);
  const rarity = RARITY_PILL[item.rarity];

  return (
    <div
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: selected ? '2px solid #0066FF' : '1px solid #E8EDF2', boxShadow: selected ? '0 0 0 3px rgba(0,102,255,0.08)' : '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)', marginBottom: 12, animation: `slideUp 0.2s ease ${index * 55}ms forwards`, opacity: 0, transition: 'border 0.15s' }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '4/3', background: '#F1F5F9' }}>
        <img src={item.preview} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
        {/* Select */}
        <button onClick={() => onSelect(item.id)} style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', border: selected ? '2px solid #0066FF' : '2px solid rgba(255,255,255,0.8)', background: selected ? '#0066FF' : 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
        {/* Rarity */}
        {rarity && (
          <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: rarity.bg, color: rarity.text, border: `1px solid ${rarity.border}` }}>
            {item.rarity}
          </span>
        )}
        {/* Price overlay on photo */}
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{fmt(price)}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 14px 10px' }}>
        {item.error ? (
          <p style={{ fontSize: 13, color: '#EF4444' }}>{item.error}</p>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.category}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{item.name}</p>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: '#CBD5E1' }}>{fmt(item.estimatedValue?.low)}–{fmt(item.estimatedValue?.high)}</p>
              </div>
            </div>

            <ConditionControl value={item.condition} onChange={c => onConditionChange(item.id, c)} />

            {/* Details toggle */}
            <button onClick={() => setOpen(!open)} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#0066FF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}><path d="M9 18l6-6-6-6"/></svg>
              {open ? 'Hide details' : 'View details'}
            </button>

            {open && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                {item.description && <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: 10 }}>{item.description}</p>}
                {(item.condition_notes && item.condition_notes !== 'No visible damage from this photo angle.') && (
                  <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Condition Notes</p>
                    <p style={{ fontSize: 12, color: '#7C2D12' }}>{item.condition_notes}</p>
                  </div>
                )}
                {(item.rarity_notes || item.rarityNote) && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Authentication</p>
                    <p style={{ fontSize: 12, color: '#475569' }}>{item.rarity_notes || item.rarityNote}</p>
                  </div>
                )}
                {item.recentSales && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Recent Sales</p>
                    <p style={{ fontSize: 12, color: '#166534' }}>{item.recentSales}</p>
                  </div>
                )}
                {item.bestPlatform && (
                  <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                    Best on <span style={{ fontWeight: 600, color: '#0066FF' }}>{item.bestPlatform}</span> — {item.bestPlatformReason}
                  </p>
                )}
                {item.ebayTitle && <CopyBox label="eBay Title" text={item.ebayTitle} />}
                {item.listingDescription && <CopyBox label="Listing Description" text={item.listingDescription} />}

                {/* Add photos */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#94A3B8', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add more photos for better accuracy
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => { onAddPhotos(item.id, e.target.files); e.target.value = ''; }} />
                </label>
              </div>
            )}
          </>
        )}

        <button onClick={() => onRemove(item.id)} style={{ width: '100%', marginTop: 10, padding: '8px 0', fontSize: 12, fontWeight: 500, color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }}
          onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
          onMouseOut={e => e.currentTarget.style.color = '#CBD5E1'}
        >Remove</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EstateApp() {
  const [tab, setTab]         = useState('home');
  const [items, setItems]     = useState(() => ls('estate_items', []));
  const [rooms, setRooms]     = useState(() => ls('estate_rooms', ['Living Room', 'Kitchen', 'Bedroom', 'Attic', 'Garage']));
  const [room, setRoom]       = useState(() => ls('estate_room', 'Living Room'));
  const [apiKey, setApiKey]   = useState(() => typeof window !== 'undefined' ? localStorage.getItem('estate_api_key') || '' : '');
  const [busy, setBusy]       = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState([]);
  const [bundle, setBundle]   = useState(null);
  const [bundling, setBundling] = useState(false);
  const [sheet, setSheet]     = useState(null);
  const [newRoom, setNewRoom] = useState('');
  const fileRef = useRef();

  useEffect(() => ss('estate_items', items), [items]);
  useEffect(() => ss('estate_rooms', rooms), [rooms]);
  useEffect(() => ss('estate_room', room), [room]);

  const roomItems = items.filter(i => i.room === room);
  const total = roomItems.reduce((s, i) => s + adj(i), 0);
  const selItems = items.filter(i => selected.includes(i.id));

  const processFiles = useCallback(async files => {
    if (!files?.length) return;
    const key = apiKey || localStorage.getItem('estate_api_key');
    if (!key) { setSheet('account'); return; }
    setBusy(true); setProgress(5); setError(null); setTab('home');
    const arr = Array.from(files);
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      setProgress(Math.round(5 + (i / arr.length) * 85));
      try {
        const b64 = await resizeImage(arr[i]);
        const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: b64, mediaType: 'image/jpeg', apiKey: key }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (d.blocked) throw new Error(`Blocked: ${d.reason}`);
        out.push({ id: Date.now() + i, preview: URL.createObjectURL(arr[i]), condition: d.condition || 'Good', room, ...d });
      } catch (e) {
        out.push({ id: Date.now() + i, preview: URL.createObjectURL(arr[i]), name: 'Analysis failed', error: e.message, estimatedValue: { low:0,high:0,best:0 }, condition: 'Good', room });
      }
    }
    setProgress(100);
    setTimeout(() => { setProgress(0); setBusy(false); }, 500);
    setItems(p => [...p, ...out]);
  }, [apiKey, room]);

  const makeBundle = async () => {
    if (selItems.length < 2) return;
    setBundling(true);
    const key = apiKey || localStorage.getItem('estate_api_key');
    const summary = selItems.map(i => `${i.name} (${i.condition}, ${fmt(adj(i))})`).join(', ');
    try {
      const r = await fetch('/api/bundle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: summary, apiKey: key }) });
      const d = await r.json();
      setBundle(d); setSheet('bundle');
    } catch(e) { setError(e.message); }
    setBundling(false);
  };

  const exportCSV = () => {
    const h = ['Name','Category','Condition','Rarity','Low','Best','High','Adjusted','Platform','eBay Title','Room'];
    const rows = items.map(i => [i.name,i.category,i.condition,i.rarity,i.estimatedValue?.low,i.estimatedValue?.best,i.estimatedValue?.high,adj(i),i.bestPlatform,i.ebayTitle,i.room]);
    const csv = [h,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='estate.csv'; a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: "'DM Sans', Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sheetIn { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes pulse { 0%,100%{box-shadow:0 4px 16px rgba(0,102,255,0.35),0 0 0 0 rgba(0,102,255,0.2);} 50%{box-shadow:0 4px 16px rgba(0,102,255,0.35),0 0 0 10px rgba(0,102,255,0);} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { transition: transform 0.1s; }
        button:active { transform: scale(0.96); }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Top progress bar */}
      {busy && progress > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: '#E2E8F0', zIndex: 200 }}>
          <div style={{ height: '100%', background: '#0066FF', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>
      )}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8EDF2', padding: '0 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {roomItems.length > 0 && (
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: '#0066FF' }}>{fmt(total)}</span>
            )}
            <button onClick={() => setTab(tab === 'account' ? 'home' : 'account')} style={{ width: 32, height: 32, borderRadius: '50%', background: tab === 'account' ? '#EEF4FF' : '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tab === 'account' ? '#0066FF' : '#64748B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Room pills */}
      <div style={{ background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8EDF2', padding: '8px 16px', overflowX: 'auto', display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          {rooms.map(r => (
            <button key={r} onClick={() => setRoom(r)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', background: room === r ? '#0066FF' : '#EAECEF', color: room === r ? '#fff' : '#64748B', transition: 'all 0.12s' }}>
              {r}
            </button>
          ))}
          <button onClick={() => setSheet('rooms')} style={{ flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20, border: '1px dashed #CBD5E1', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>+ Room</button>
        </div>
      </div>

      {/* Selection / totals bar */}
      {(roomItems.length > 0 || selected.length > 0) && (
        <div style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', padding: '10px 16px' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {selected.length > 0 ? (
              <>
                <span style={{ fontSize: 13, color: '#64748B', flex: 1 }}>{selected.length} selected</span>
                <button onClick={() => setSelected([])} style={{ fontSize: 12, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                <button onClick={makeBundle} disabled={bundling || selected.length < 2} style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#0066FF', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', opacity: selected.length < 2 ? 0.5 : 1 }}>
                  {bundling ? 'Bundling…' : `Bundle ${selected.length}`}
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{roomItems.length} item{roomItems.length !== 1 ? 's' : ''}</span>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9', margin: '0 8px' }} />
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: '#0066FF' }}>{fmt(total)}</span>
                <button onClick={exportCSV} style={{ fontSize: 11, color: '#94A3B8', background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', marginLeft: 8 }}>Export</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 100px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#DC2626', display: 'flex', justifyContent: 'space-between' }}>
            {error} <button onClick={() => setError(null)} style={{ color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Account tab */}
        {tab === 'account' && (
          <div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Account</p>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EDF2', padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Claude API Key</p>
              <input type="password" value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem('estate_api_key', e.target.value); }} placeholder="sk-ant-..."
                style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'ui-monospace,monospace', color: '#0F172A', outline: 'none', background: '#FAFAFA' }} />
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>Stored in your browser only. <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: '#0066FF' }}>Get a key →</a></p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EDF2', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Inventory</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportCSV} style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 500, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, cursor: 'pointer' }}>Export CSV</button>
                <button onClick={() => { if (confirm('Clear all items?')) setItems([]); }} style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 500, color: '#EF4444', background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, cursor: 'pointer' }}>Clear all</button>
              </div>
            </div>
          </div>
        )}

        {/* Rooms tab */}
        {tab === 'rooms' && (
          <div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Rooms</p>
            {rooms.map(r => (
              <button key={r} onClick={() => { setRoom(r); setTab('home'); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 12, border: `1px solid ${room === r ? '#BFDBFE' : '#E8EDF2'}`, padding: '12px 16px', marginBottom: 8, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: room === r ? '#0066FF' : '#334155' }}>{r}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{items.filter(i=>i.room===r).length}</span>
              </button>
            ))}
            <button onClick={() => setSheet('rooms')} style={{ width: '100%', padding: '10px 0', fontSize: 13, color: '#0066FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>+ Add room</button>
          </div>
        )}

        {/* Home tab */}
        {tab === 'home' && (
          roomItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 96 96" fill="none" style={{ marginBottom: 16, opacity: 0.35 }}>
                <path d="M12 44L48 12L84 44" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 36V80H76V36" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M36 80V56H60V80" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="36" y="38" width="10" height="10" rx="1" stroke="#64748B" strokeWidth="2"/>
                <rect x="50" y="38" width="10" height="10" rx="1" stroke="#64748B" strokeWidth="2"/>
              </svg>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Nothing here yet</p>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>Tap the button below to photograph your first item</p>
              <button onClick={() => fileRef.current?.click()} style={{ width: 56, height: 56, borderRadius: '50%', background: '#0066FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2.2s ease-in-out infinite' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
          ) : (
            <div>
              {roomItems.map((item, i) => (
                <ItemCard
                  key={item.id} item={item} index={i}
                  selected={selected.includes(item.id)}
                  onSelect={id => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])}
                  onRemove={id => { setItems(p=>p.filter(i=>i.id!==id)); setSelected(p=>p.filter(x=>x!==id)); }}
                  onConditionChange={(id,c) => setItems(p=>p.map(i=>i.id===id?{...i,condition:c}:i))}
                  onAddPhotos={async (id, files) => {
                    const key = apiKey || localStorage.getItem('estate_api_key');
                    for (const f of Array.from(files)) {
                      const b64 = await resizeImage(f);
                      const r = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mediaType:'image/jpeg',apiKey:key})});
                      const d = await r.json();
                      if (r.ok && !d.blocked) setItems(p=>p.map(i=>i.id===id?{...i,description:d.description||i.description,rarityNote:d.rarityNote||i.rarityNote,rarity_notes:d.rarity_notes||i.rarity_notes,recentSales:d.recentSales||i.recentSales}:i));
                    }
                  }}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* Bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid #E8EDF2' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, padding: '0 32px' }}>
          {/* Home */}
          <button onClick={() => setTab('home')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab==='home'?'#0066FF':'#94A3B8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, color: tab==='home'?'#0066FF':'#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</span>
          </button>

          {/* FAB */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => fileRef.current?.click()} style={{ width: 52, height: 52, marginTop: -20, borderRadius: '50%', background: '#0066FF', border: '3px solid #F7F8FA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,102,255,0.4)', animation: items.length===0?'pulse 2.2s ease-in-out infinite':undefined }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          {/* Rooms */}
          <button onClick={() => setTab('rooms')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab==='rooms'?'#0066FF':'#94A3B8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18M9 21V9m6 12V9M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, color: tab==='rooms'?'#0066FF':'#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rooms</span>
          </button>
        </div>
      </nav>

      {/* Sheets */}
      <Sheet open={sheet==='bundle'} onClose={() => setSheet(null)} title="Bundle Pricing">
        {bundle && (
          <div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
              {[['Individual', fmt(bundle.individualTotal), '#64748B'],['Bundle', fmt(bundle.bundlePrice), '#0066FF'],['Saving', `${bundle.discountPercent}%`, '#16A34A']].map(([l,v,c]) => (
                <div key={l}>
                  <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{l}</p>
                  <p style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: c }}>{v}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 10 }}>{bundle.rationale}</p>
            <CopyBox label="Bundle Listing" text={bundle.description} />
          </div>
        )}
      </Sheet>

      <Sheet open={sheet==='rooms'} onClose={() => setSheet(null)} title="Add Room">
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newRoom} onChange={e=>setNewRoom(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newRoom.trim()){setRooms(p=>[...p,newRoom.trim()]);setNewRoom('');setSheet(null);}}} placeholder="Room name..." autoFocus
            style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none' }} />
          <button onClick={()=>{if(newRoom.trim()){setRooms(p=>[...p,newRoom.trim()]);setNewRoom('');setSheet(null);}}} style={{ background:'#0066FF',color:'#fff',border:'none',borderRadius:10,padding:'11px 18px',fontSize:14,fontWeight:600,cursor:'pointer' }}>Add</button>
        </div>
      </Sheet>

      <Sheet open={sheet==='account'} onClose={() => setSheet(null)} title="API Key Required">
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Enter your Claude API key to analyze photos.</p>
        <input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem('estate_api_key',e.target.value);}} placeholder="sk-ant-..." autoFocus
          style={{ width:'100%',border:'1px solid #E2E8F0',borderRadius:10,padding:'12px 14px',fontSize:13,fontFamily:'ui-monospace,monospace',outline:'none',marginBottom:10 }} />
        <button onClick={()=>setSheet(null)} style={{ width:'100%',background:'#0066FF',color:'#fff',border:'none',borderRadius:10,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer' }}>Save & continue</button>
      </Sheet>

      <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={e=>{processFiles(e.target.files);e.target.value='';}} />
    </div>
  );
}
