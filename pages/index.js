import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans flex flex-col">
      <nav className="border-b border-[#1e2a3a] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">est<span className="text-blue-400">🏠</span>te</span>
          <Link href="/app" className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition font-medium">
            Open app →
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Snap it.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Price it. Sell it.
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-lg mb-10 leading-relaxed">
          Photo-to-price AI for everything in your home. Know what it's worth, where to sell it, and get a ready-to-post listing in seconds.
        </p>
        <Link href="/app" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition text-base">
          Start for free →
        </Link>
        <p className="text-slate-600 text-xs mt-4">Bring your own Claude API key · Free to use</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[
            { icon: '📸', title: 'Snap up to 10 photos', desc: 'Drop a batch of photos and get instant valuations for every item.' },
            { icon: '💰', title: 'Real market prices', desc: 'AI estimates based on actual eBay sold listings, not asking prices.' },
            { icon: '📋', title: 'Ready-to-post listings', desc: 'eBay titles and full descriptions written and ready to copy.' },
          ].map(f => (
            <div key={f.title} className="bg-[#161c27] border border-[#1e2a3a] rounded-2xl p-5 text-left">
              <span className="text-2xl block mb-2">{f.icon}</span>
              <p className="font-semibold text-slate-100 text-sm mb-1">{f.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t border-[#1e2a3a] px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-xs text-slate-600">
          <Link href="/faq" className="hover:text-slate-300 transition">FAQ</Link>
          <Link href="/pricing" className="hover:text-slate-300 transition">Pricing</Link>
          <Link href="/privacy" className="hover:text-slate-300 transition">Privacy</Link>
          <Link href="/tos" className="hover:text-slate-300 transition">Terms</Link>
          <Link href="/contact" className="hover:text-slate-300 transition">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
