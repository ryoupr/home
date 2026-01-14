import { useMemo } from 'react';
import { ProjectCard } from './ProjectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import config from '../../data/config.json';

// プロジェクトの型定義
interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  category: 'webapp' | 'program' | 'extension';
}

// Load projects from config.json
const projects: Project[] = config.projects as Project[];

export function ProjectsSection() {
  // useMemo でフィルタリング結果をメモ化
  const webapps = useMemo(() => projects.filter((p) => p.category === 'webapp'), []);
  const programs = useMemo(() => projects.filter((p) => p.category === 'program'), []);
  const extensions = useMemo(() => projects.filter((p) => p.category === 'extension'), []);

  return (
    <section id="projects" className="py-20 px-4 bg-slate-950 relative overflow-hidden">
      {/* テッキーな背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      
      {/* グロー効果 */}
      <div className="absolute top-40 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative">
        <h2 className="text-center mb-12 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-mono">
          <span className="text-cyan-400 text-2xl">&lt;</span> Projects <span className="text-purple-400 text-2xl">/&gt;</span>
        </h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-mono text-sm data-[state=active]:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="webapp" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-mono text-sm data-[state=active]:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Web Apps
            </TabsTrigger>
            <TabsTrigger 
              value="program" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-mono text-sm data-[state=active]:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Programs
            </TabsTrigger>
            <TabsTrigger 
              value="extension" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-mono text-sm data-[state=active]:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Extensions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="webapp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webapps.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="program">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="extension">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extensions.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}