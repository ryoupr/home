export function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-800 py-8 px-4 bg-slate-950">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-slate-400 mb-4 font-mono text-sm">
          <span className="text-cyan-400">&gt;</span> お仕事のご依頼やお問い合わせは、メールまたはSNSからお気軽にご連絡ください。
        </p>
        <p className="text-sm text-slate-600 font-mono">
          © {new Date().getFullYear()} Your Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
}