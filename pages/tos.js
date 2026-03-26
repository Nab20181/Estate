import Link from 'next/link';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-slate-100 mb-3">{title}</h2>
    <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TOS() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>

        <Section title="Acceptance">
          <p>By using Estate, you agree to these terms. If you don't agree, don't use the service.</p>
        </Section>

        <Section title="What Estate Is">
          <p>Estate is an AI-powered appraisal and listing tool that analyzes photos of items and provides estimated valuations and listing content. All valuations are estimates only and should not be relied upon as professional appraisals.</p>
        </Section>

        <Section title="Acceptable Use">
          <p>You agree not to upload photos of:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>People, faces, or body parts as the primary subject</li>
            <li>Weapons, firearms, or ammunition</li>
            <li>Prescription medications or controlled substances</li>
            <li>Live animals</li>
            <li>Adult or explicit content</li>
            <li>Government IDs or financial documents</li>
            <li>Any item that is illegal to sell in your jurisdiction</li>
          </ul>
          <p>You are solely responsible for ensuring items you list comply with all applicable laws and platform policies.</p>
        </Section>

        <Section title="Your API Key">
          <p>If you supply a Claude API key, you are responsible for all usage and costs associated with that key. Estate is not liable for any API charges incurred through use of the service.</p>
        </Section>

        <Section title="Valuations & Accuracy">
          <p>All valuations provided by Estate are AI-generated estimates based on historical marketplace data. They are not professional appraisals and may not reflect current market conditions. Estate makes no warranty as to the accuracy of any valuation.</p>
        </Section>

        <Section title="Payments & Refunds">
          <p>Paid plans are billed monthly in advance. You may cancel at any time — access continues until the end of your billing period. <strong className="text-slate-300">All sales are final. We do not offer refunds.</strong></p>
        </Section>

        <Section title="No Warranties">
          <p>Estate is provided "as is" without warranty of any kind. We do not guarantee uptime, accuracy, or fitness for any particular purpose.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>To the maximum extent permitted by law, Estate and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </Section>

        <Section title="Changes">
          <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
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
