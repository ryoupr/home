import { Github, Linkedin, Mail, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

export function Hero() {
  return (
    <section id="about" className="py-20 px-4 relative overflow-hidden bg-slate-950">
      {/* テッキーな背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
      
      {/* グロー効果 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-4xl text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center justify-center gap-2"
        >
          <Terminal className="size-8 text-cyan-400" />
          <h2 className="mb-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-mono">
            $ Developer Portfolio
          </h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-slate-300 mb-8 font-mono"
        >
          <span className="text-cyan-400">&gt;</span> Webアプリケーション、プログラム、Chrome拡張機能の開発を行っています。
          <br />
          <span className="text-purple-400">&gt;</span> これまでに作成したプロジェクトをご紹介します。
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 group"
            aria-label="GitHub"
          >
            <Github className="size-6 text-cyan-400 group-hover:text-cyan-300" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 group"
            aria-label="LinkedIn"
          >
            <Linkedin className="size-6 text-blue-400 group-hover:text-blue-300" />
          </a>
          <a
            href="mailto:your.email@example.com"
            className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 group"
            aria-label="Email"
          >
            <Mail className="size-6 text-purple-400 group-hover:text-purple-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}