import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const CONDITION_MULTIPLIER = { Mint: 1.2, Excellent: 1.0, Good: 0.8, Fair: 0.55, Poor: 0.35 };
const RARITY_COLOR = {
  Common: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  Uncommon: 'text-green-400 bg-green-400/10 border-green-400/20',
  Rare: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Very Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Extremely Rare': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl.split(',')[1]); // return base64 only
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function EstateApp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('estate_api_key') || '' : ''
  );
  const [selected, setSelected] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [bundling, setBundling] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const fileRef = useRef();

  const adjustedPrice = (item) => {
    const mult = CONDITION_MULTIPLIER[item.condition] || 1.0;
    return Math.round(item.estimatedValue?.best * mult);
  };

  const totalValue = items.reduce((sum, item) => sum + adjustedPrice(item), 0);

  const processFiles = useCallback(async (files) => {
    if (!files?.length) return;
    const key = apiKey || localStorage.getItem('estate_api_key');
    if (!key) { setError('Please enter your Claude API key first.'); return; }

    setLoading(true);
    setError(null);

    const fileArray = Array.from(files);
    const newItems = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setLoadingText(`Analyzing item ${i + 1} of ${fileArray.length}...`);
      try {
        const base64 = await resizeImage(file);
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mediaType: 'image/jpeg',
            apiKey: key,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        newItems.push({
          id: Date.now() + i,
          preview: URL.createObjectURL(file),
          condition: data.condition || 'Good',
          expanded: false,
          ...data,
        });
      } catch (err) {
        newItems.push({
          id: Date.now() + i,
          preview: URL.createObjectURL(file),
          name: 'Analysis failed',
          error: err.message,
          estimatedValue: { low: 0, high: 0, best: 0 },
          condition: 'Good',
        });
      }
    }

    setItems(prev => [...prev, ...newItems]);
    setLoading(false);
    setLoadingText('');
  }, [apiKey]);

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const makeBundle = async () => {
    const bundleItems = items.filter(i => selected.includes(i.id));
    if (bundleItems.length < 2) return;
    setBundling(true);
    const key = apiKey || localStorage.getItem('estate_api_key');
    const summary = bundleItems.map(i => `${i.name} (${i.condition}, $${adjustedPrice(i)})`).join(', ');
    try {
      const res = await fetch('/api/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: summary, apiKey: key }),
      });
      const data = await res.json();
      setBundle(data);
    } catch (err) {
      setError(err.message);
    }
    setBundling(false);
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setCondition = (id, condition) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, condition } : item));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
  };

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Condition', 'Rarity', 'Low ($)', 'Best ($)', 'High ($)', 'Adjusted ($)', 'Best Platform', 'eBay Title'];
    const rows = items.map(i => [
      i.name, i.category, i.condition, i.rarity,
      i.estimatedValue?.low, i.estimatedValue?.best, i.estimatedValue?.high,
      adjustedPrice(i), i.bestPlatform, i.ebayTitle,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'estate-inventory.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0b1120]/95 backdrop-blur border-b border-[#1e2a3a] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">est<span className="text-blue-400">🏠</span>te</span>
          </Link>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <>
                <span className="text-sm font-semibold text-blue-400">${totalValue.toLocaleString()} total</span>
                <button onClick={exportCSV} className="text-xs text-slate-400 hover:text-slate-200 bg-[#161c27] border border-[#1e2a3a] px-3 py-1.5 rounded-lg transition">
                  Export CSV
                </button>
              </>
            )}
            {selected.length >= 2 && (
              <button
                onClick={makeBundle}
                disabled={bundling}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
              >
                {bundling ? 'Bundling...' : `Bundle ${selected.length} items`}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* API Key */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Claude API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); localStorage.setItem('estate_api_key', e.target.value); }}
            placeholder="sk-ant-... (saved in your browser)"
            className="w-full max-w-md bg-[#161c27] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/60 transition font-mono"
          />
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#1e2a3a] hover:border-blue-500/40 rounded-2xl p-10 text-center cursor-pointer transition mb-6 bg-[#161c27]/50"
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => { processFiles(e.target.files); e.target.value = ''; }}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="text-slate-400 text-sm">{loadingText}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📸</span>
              <p className="text-slate-300 font-medium">Drop photos here or click to browse</p>
              <p className="text-slate-500 text-sm">Up to 10 photos at once · JPEG, PNG, HEIC</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Bundle result */}
        {bundle && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-100">Bundle Pricing</h3>
              <button onClick={() => setBundle(null)} className="text-slate-500 hover:text-slate-300 text-xs">Dismiss</button>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="text-center">
                <p className="text-xs text-slate-500">Individual total</p>
                <p className="text-lg font-bold text-slate-300">${bundle.individualTotal}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Bundle price</p>
                <p className="text-lg font-bold text-blue-400">${bundle.bundlePrice}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Discount</p>
                <p className="text-lg font-bold text-green-400">{bundle.discountPercent}% off</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-3">{bundle.rationale}</p>
            <div className="bg-[#0d1420] rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">Bundle listing description</span>
                <button onClick={() => copyText(bundle.description, 'bundle')} className="text-xs text-blue-400 hover:text-blue-300">
                  {copiedId === 'bundle' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{bundle.description}</p>
            </div>
          </div>
        )}

        {/* Items grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className={`bg-[#161c27] border rounded-2xl overflow-hidden transition ${
                  selected.includes(item.id) ? 'border-blue-500/50' : 'border-[#1e2a3a]'
                }`}
              >
                {/* Photo + overlay */}
                <div className="relative">
                  <img src={item.preview} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161c27] to-transparent" />
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition flex items-center justify-center text-xs font-bold ${
                      selected.includes(item.id)
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-[#161c27]/80 border-slate-500 text-transparent'
                    }`}
                  >✓</button>
                  {item.rarity && item.rarity !== 'Common' && (
                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full border font-medium ${RARITY_COLOR[item.rarity]}`}>
                      {item.rarity}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {item.error ? (
                    <div>
                      <p className="text-red-400 text-sm font-medium mb-1">Analysis failed</p>
                      <p className="text-slate-500 text-xs">{item.error}</p>
                    </div>
                  ) : (
                    <>
                      {/* Name + price */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-slate-100 text-sm leading-snug">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-blue-400 font-bold">${adjustedPrice(item)}</p>
                          <p className="text-slate-600 text-xs">${item.estimatedValue?.low}–${item.estimatedValue?.high}</p>
                        </div>
                      </div>

                      {/* Condition selector */}
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {Object.keys(CONDITION_MULTIPLIER).map(c => (
                          <button
                            key={c}
                            onClick={() => setCondition(item.id, c)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition ${
                              item.condition === c
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-transparent border-[#1e2a3a] text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>

                      {/* Name override */}
                      <input
                        type="text"
                        defaultValue={item.name}
                        onBlur={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                        className="w-full bg-[#0d1420] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-blue-500/60 transition mb-2"
                        placeholder="Correct the item name if wrong..."
                      />

                      {/* Expandable details */}
                      <details className="group">
                        <summary className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer list-none flex items-center gap-1">
                          <span className="group-open:hidden">▶ Show details</span>
                          <span className="hidden group-open:inline">▼ Hide details</span>
                        </summary>
                        <div className="mt-3 space-y-3 text-sm">
                          <p className="text-slate-400 leading-relaxed">{item.description}</p>
                          {item.rarityNote && (
                            <div className="bg-[#0d1420] rounded-lg p-3">
                              <p className="text-xs text-slate-500 mb-1">Rarity / Authentication</p>
                              <p className="text-slate-300 text-xs">{item.rarityNote}</p>
                            </div>
                          )}
                          {item.recentSales && (
                            <div className="bg-[#0d1420] rounded-lg p-3">
                              <p className="text-xs text-slate-500 mb-1">Recent Sales</p>
                              <p className="text-slate-300 text-xs">{item.recentSales}</p>
                            </div>
                          )}
                          {item.bestPlatform && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Best platform:</span>
                              <span className="text-xs font-medium text-blue-400">{item.bestPlatform}</span>
                              <span className="text-xs text-slate-500">— {item.bestPlatformReason}</span>
                            </div>
                          )}
                          {item.ebayTitle && (
                            <div className="bg-[#0d1420] rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-slate-500">eBay Title</p>
                                <button onClick={() => copyText(item.ebayTitle, `title-${item.id}`)} className="text-xs text-blue-400 hover:text-blue-300">
                                  {copiedId === `title-${item.id}` ? '✓' : 'Copy'}
                                </button>
                              </div>
                              <p className="text-slate-200 text-xs font-medium">{item.ebayTitle}</p>
                            </div>
                          )}
                          {item.listingDescription && (
                            <div className="bg-[#0d1420] rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-slate-500">Listing Description</p>
                                <button onClick={() => copyText(item.listingDescription, `desc-${item.id}`)} className="text-xs text-blue-400 hover:text-blue-300">
                                  {copiedId === `desc-${item.id}` ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{item.listingDescription}</p>
                            </div>
                          )}
                        </div>
                      </details>
                    </>
                  )}

                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-3 text-xs text-slate-600 hover:text-red-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-600">
            <p className="text-5xl mb-3">🏠</p>
            <p className="text-slate-400 font-medium">Your inventory is empty</p>
            <p className="text-sm mt-1">Drop some photos above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
