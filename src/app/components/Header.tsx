import { Code2 } from 'lucide-react';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
] as const;

export function Header() {
  return (
    <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 shadow-lg shadow-cyan-500/5">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="size-6 text-cyan-400" />
          <h1 className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
            Portfolio
          </h1>
        </div>
        <nav className="flex gap-6 items-center font-mono text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-slate-300 hover:text-cyan-400 transition-colors relative group"
            >
              <span className="text-cyan-400">&lt;</span>
              {label}
              <span className="text-cyan-400">/&gt;</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
