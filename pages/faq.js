import Link from 'next/link';
import { useState } from 'react';

const FAQS = [
  { q: "What is Estate?", a: "Estate is an AI-powered appraisal tool. Take photos of items around your home and instantly get estimated values, recent sales data, rarity assessments, and ready-to-post listing descriptions for eBay and other platforms." },
  { q: "How does the valuation work?", a: "Estate uses Claude AI vision to identify your item from photos, then estimates value based on real sold listings from eBay, Reverb, Poshmark, and other marketplaces. Prices reflect actual sold comps, not retail or asking prices." },
  { q: "Why do I need a Claude API key?", a: "Estate uses Claude AI to analyze photos. During our beta, users bring their own Claude API key so you only pay for what you use. New Anthropic accounts come with free credits. Once we launch paid plans, you won't need your own key." },
  { q: "Is my API key stored anywhere?", a: "No. Your API key is saved only in your browser's localStorage. It is never sent to our servers or stored in any database." },
  { q: "How accurate are the prices?", a: "Prices are estimates based on Claude's training data from real marketplace sold listings. They're a solid starting point but may not reflect today's exact market. We recommend cross-checking on eBay's completed listings before pricing your item." },
  { q: "Why did my item get blocked?", a: "Estate mirrors eBay and Facebook Marketplace policies. We block people/faces, weapons, prescription medications, live animals, alcohol, adult content, and government documents. If your item was incorrectly blocked, try a closer photo of just the item." },
  { q: "Can I upload multiple photos of one item?", a: "Yes — after an item is analyzed, hit 'Add more photos' to upload additional angles. This improves accuracy for items like instruments where handedness and string count matter." },
  { q: "What is the bundle pricing feature?", a: "Select 2 or more items using the checkboxes, then hit 'Bundle X items'. Estate calculates a smart bundle discount (10-25% off) and writes a ready-to-post bundle listing description." },
  { q: "Can Estate post directly to eBay?", a: "Direct eBay posting via API is on our roadmap. Right now, Estate generates optimized eBay titles and listing descriptions that you can copy and paste directly into eBay's listing form." },
  { q: "What's the pricing for Estate?", a: "Estate is currently free to use with your own Claude API key. Paid plans are coming soon — see our pricing page for details." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1e2a3a] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-slate-100 text-sm font-medium">{q}</span>
        <span className={`text-slate-500 text-lg shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <p className="text-slate-400 text-sm leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-slate-400 text-sm mb-10">Everything you need to know about Estate.</p>
        <div className="bg-[#161c27] border border-[#1e2a3a] rounded-2xl px-6">
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
        <p className="text-center text-slate-500 text-sm mt-10">Still have questions? <a href="mailto:hello@estate.app" className="text-blue-400 hover:text-blue-300">hello@estate.app</a></p>
      </div>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="border-b border-[#1e2a3a] px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">est<span className="text-blue-400">🏠</span>te</Link>
        <Link href="/app" className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition font-medium">Open app →</Link>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1e2a3a] px-6 py-8 mt-8">
      <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition">Home</Link>
        <Link href="/faq" className="hover:text-slate-300 transition">FAQ</Link>
        <Link href="/pricing" className="hover:text-slate-300 transition">Pricing</Link>
        <Link href="/privacy" className="hover:text-slate-300 transition">Privacy</Link>
        <Link href="/tos" className="hover:text-slate-300 transition">Terms</Link>
        <Link href="/contact" className="hover:text-slate-300 transition">Contact</Link>
      </div>
    </footer>
  );
}
