import { Chrome, ExternalLink, Github } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  category: 'webapp' | 'program' | 'extension';
}

const CATEGORY_LABELS = {
  webapp: 'Web App',
  program: 'Program',
  extension: 'Extension',
} as const;

const CATEGORY_COLORS = {
  webapp:
    'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/50',
  program:
    'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50',
  extension:
    'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/50',
} as const;

export function ProjectCard({
  title,
  description,
  tags,
  demoUrl,
  githubUrl,
  category,
}: ProjectCardProps) {
  // Chrome拡張機能かどうかで表示を変える
  const isExtension = category === 'extension';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="h-full flex flex-col bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl text-slate-100 font-mono flex items-center gap-2">
              <span className="text-cyan-400 text-sm">//</span>
              {title}
            </CardTitle>
            <span
              className={`px-3 py-1 rounded-md text-xs font-mono ${CATEGORY_COLORS[category]}`}
            >
              {CATEGORY_LABELS[category]}
            </span>
          </div>
          <CardDescription className="text-base text-slate-400">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-800/50 text-slate-300 border border-slate-700 rounded text-sm font-mono hover:border-cyan-500/50 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {demoUrl && (
              <Button
                variant="default"
                size="sm"
                asChild
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] font-mono"
              >
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  {isExtension ? (
                    <>
                      <Chrome className="size-4 mr-2" />
                      Chrome Web Store
                    </>
                  ) : (
                    <>
                      <ExternalLink className="size-4 mr-2" />
                      Demo
                    </>
                  )}
                </a>
              </Button>
            )}
            {githubUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 font-mono"
              >
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="size-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
