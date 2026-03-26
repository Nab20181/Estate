import Link from 'next/link';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-slate-100 mb-3">{title}</h2>
    <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>

        <Section title="Overview">
          <p>Estate is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>
        </Section>

        <Section title="Data We Collect">
          <p><strong className="text-slate-300">Photos:</strong> Photos you upload are sent to the Anthropic Claude API for analysis. They are processed in real time and not stored by Estate on our servers.</p>
          <p><strong className="text-slate-300">API Keys:</strong> Your Claude API key is stored only in your browser's localStorage. It is never transmitted to our servers.</p>
          <p><strong className="text-slate-300">Waitlist/account email:</strong> If you sign up, we store your email to contact you about the service.</p>
          <p><strong className="text-slate-300">Usage analytics:</strong> We may collect anonymous page view data to improve the product. No personally identifiable information is attached.</p>
        </Section>

        <Section title="Photos & AI Processing">
          <p>Photos you upload are sent server-side to the Anthropic Claude API using your API key. Anthropic's privacy policy governs their handling of API requests. Estate does not store, log, or retain your photos after analysis is complete.</p>
        </Section>

        <Section title="Data We Don't Collect">
          <p>We do not store your photos, analysis results, or item inventory. Each session is processed in real time. We have no database of your items or valuations.</p>
        </Section>

        <Section title="Third-Party Services">
          <p><strong className="text-slate-300">Anthropic (Claude):</strong> Photo analysis via the Claude API. See anthropic.com/privacy.</p>
          <p><strong className="text-slate-300">Vercel:</strong> Hosting provider. Standard server logs may be retained per Vercel's privacy policy.</p>
        </Section>

        <Section title="Your Rights">
          <p>If you've joined our waitlist and want your email removed, contact us and we will delete it immediately.</p>
        </Section>

        <Section title="Contact">
          <p>Questions? <a href="mailto:hello@estate.app" className="text-blue-400 hover:text-blue-300">hello@estate.app</a></p>
        </Section>
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
