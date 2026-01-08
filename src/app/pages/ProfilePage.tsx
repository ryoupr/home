import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Briefcase, Code2, User, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useGitHubStats } from '../hooks/useGitHubStats';
import config from '../../data/config.json';

export function ProfilePage() {
  const { personal } = config;
  const { totalStars, totalRepos, loading } = useGitHubStats(personal.github.split('/').pop() || '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <User className="size-6" />
            </div>
            <div>
              <h1 className="font-bold">{personal.name}</h1>
              <p className="text-sm text-gray-600">{personal.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* About Section */}
        <section className="mb-12">
          <h2 className="mb-4 text-gray-900">About</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed mb-6">
                {personal.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {personal.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {loading ? '...' : `${totalRepos}+`}
                </div>
                <div className="text-sm text-gray-600">プロジェクト</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">3+</div>
                <div className="text-sm text-gray-600">年の経験</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {loading ? '...' : totalStars >= 1000 ? `${Math.floor(totalStars / 1000)}k+` : `${totalStars}`}
                </div>
                <div className="text-sm text-gray-600">GitHub Stars</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="mb-4 text-gray-900">Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/projects">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Briefcase className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">プロジェクト一覧</h3>
                    <p className="text-sm text-gray-600">制作物をご覧いただけます</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <a href={personal.github} target="_blank" rel="noopener noreferrer">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Code2 className="size-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">GitHub</h3>
                    <p className="text-sm text-gray-600">コードを公開しています</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            {personal.qiita && (
              <a href={personal.qiita} target="_blank" rel="noopener noreferrer">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <BookOpen className="size-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg mb-1">ブログ / Qiita</h3>
                      <p className="text-sm text-gray-600">技術記事を投稿しています</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-gray-900">Contact</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-6">
                お仕事のご依頼、共同開発のご相談など、お気軽にご連絡ください。
              </p>
              <div className="space-y-4">
                <a
                  href={`mailto:${personal.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Mail className="size-5" />
                  <span>{personal.email}</span>
                </a>
                <a
                  href={personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Github className="size-5" />
                  <span>GitHub Profile</span>
                </a>
                <a
                  href={personal.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="size-5" />
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2026 {personal.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}