import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <Nav />
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        {submitted ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Message received</h2>
            <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
            <Link href="/" className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300">← Back to app</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Contact us</h1>
            <p className="text-slate-400 text-sm mb-10">We read every message and reply within 24 hours.</p>

            <form onSubmit={handleSubmit} className="bg-[#161c27] border border-[#1e2a3a] rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
                  <input type="text" required placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-[#0d1420] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/60 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-[#0d1420] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/60 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Subject</label>
                <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                  className="w-full bg-[#0d1420] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500/60 transition">
                  <option value="" disabled>Select a topic</option>
                  <option value="bug">Bug report</option>
                  <option value="billing">Billing question</option>
                  <option value="feature">Feature request</option>
                  <option value="accuracy">Valuation accuracy</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
                <textarea required rows={5} placeholder="Tell us what's going on..." value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full bg-[#0d1420] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/60 transition resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#1e2a3a] disabled:text-slate-600 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Sending...</>) : 'Send message'}
              </button>
            </form>
            <p className="text-center text-slate-600 text-xs mt-6">Or email directly: <a href="mailto:hello@estate.app" className="text-blue-400 hover:text-blue-300">hello@estate.app</a></p>
          </>
        )}
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
