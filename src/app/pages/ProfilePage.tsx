import { ArrowRight, BookOpen, Github, Linkedin, Mail } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import config from '../../data/config.json';
import { TOOLS } from '../../data/tools';
import { type GearProject, GearTag } from '../components/trail/GearTag';
import { ToolsLegend } from '../components/trail/ToolsLegend';
import { TrailLayout } from '../components/trail/TrailLayout';
import { extractGitHubUsername, useGitHubStats } from '../hooks/useGitHubStats';
import { usePageTitle } from '../hooks/usePageTitle';
import { decodeEmail } from '../utils/decodeEmail';

/** トップページに吊るすプロジェクトの数（新しい順） */
const FEATURED_COUNT = 3;

function SectionHeading({
  title,
  note,
  action,
}: {
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
      <h2 className="tg-display text-[1.625rem] tracking-[0.1em]">{title}</h2>
      <span className="tg-label">{note}</span>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  );
}

export function ProfilePage() {
  usePageTitle('Portfolio');
  const { personal, projects } = config;
  const email = useMemo(
    () => decodeEmail(personal.email, !!personal.emailEncoded),
    [personal.email, personal.emailEncoded]
  );
  const { totalStars, totalRepos, loading, error } = useGitHubStats(
    extractGitHubUsername(personal.github)
  );
  const featured: GearProject[] = useMemo(
    () => [...projects].sort((a, b) => b.id - a.id).slice(0, FEATURED_COUNT),
    [projects]
  );

  const statValue = (n: number) => (loading ? '…' : error ? '—' : n);
  const spec: { label: string; value: ReactNode; unit?: string }[] = [
    { label: 'Repositories', value: statValue(totalRepos), unit: '+' },
    { label: 'Experience', value: '3', unit: '+ yrs' },
    { label: 'GitHub Stars', value: statValue(totalStars) },
  ];

  const contacts = [
    { icon: Mail, label: 'Email', text: email, href: `mailto:${email}` },
    {
      icon: Github,
      label: 'GitHub',
      text: personal.github.replace(/^https:\/\//, ''),
      href: personal.github,
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      text: 'LinkedIn Profile',
      href: personal.linkedin,
    },
    ...(personal.qiita
      ? [
          {
            icon: BookOpen,
            label: 'Qiita',
            text: '技術記事',
            href: personal.qiita,
          },
        ]
      : []),
  ];

  return (
    <TrailLayout>
      <div className="flex flex-col gap-14">
        {/* Hero + SPEC */}
        <section className="grid items-start gap-8 md:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <h1 className="tg-display text-[clamp(2.25rem,6vw,3.5rem)] leading-none tracking-[0.02em] text-balance">
              Build tools.
              <br />
              <span className="text-webbing">Go outside.</span>
            </h1>
            <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-[1.85]">
              {personal.description}
            </p>
            <p className="tg-label mt-3">
              Off the clock · {personal.interests.join(' / ')}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {personal.skills.map((skill) => (
                <li
                  key={skill}
                  className="border border-ink bg-surface px-2.5 py-0.5 font-mono text-[0.72rem] transition-colors duration-500"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div className="tg-panel">
            <div className="flex items-baseline justify-between bg-ink px-3.5 py-2 text-ground transition-colors duration-500">
              <span className="font-display text-[0.95rem] font-semibold tracking-[0.14em]">
                SPEC
              </span>
              <span className="font-mono text-[0.65rem] opacity-80">
                GitHub · live
              </span>
            </div>
            <dl className="grid grid-cols-[auto_1fr]">
              {spec.map(({ label, value, unit }, i) => (
                <div key={label} className="contents">
                  <dt
                    className={`tg-label flex items-center px-3.5 py-2 ${i ? 'border-t border-line' : ''}`}
                  >
                    {label}
                  </dt>
                  <dd
                    className={`px-3.5 py-2 text-right font-display text-[1.375rem] font-semibold tabular-nums ${i ? 'border-t border-line' : ''}`}
                  >
                    {value}
                    {unit && value !== '…' && value !== '—' && (
                      <small className="ml-0.5 text-[0.8rem] font-medium text-ink-muted">
                        {unit}
                      </small>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Projects（ギア棚） */}
        <section>
          <SectionHeading
            title="Projects"
            note={`Gear rack · ${featured.length} / ${projects.length}`}
            action={
              <Link
                to="/projects"
                className="tg-nav-link inline-flex items-center gap-1 font-mono text-xs"
              >
                All projects{' '}
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            }
          />
          <div className="tg-rail" aria-hidden="true" />
          <div className="grid gap-x-5 gap-y-2 md:grid-cols-3">
            {featured.map((project) => (
              <GearTag key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Tools（凡例） */}
        <section>
          <SectionHeading
            title="Tools"
            note={`Legend · 凡例 · ${TOOLS.length} tools`}
          />
          <ToolsLegend />
        </section>

        {/* Contact */}
        <section>
          <SectionHeading title="Base camp" note="Contact · 連絡先" />
          <div className="tg-panel grid gap-4 p-5 md:grid-cols-[1fr_1.4fr] md:items-start">
            <p className="text-[0.9rem] leading-relaxed">
              お仕事のご依頼、共同開発のご相談など、お気軽にご連絡ください。
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {contacts.map(({ icon: Icon, label, text, href }) => {
                const external = href.startsWith('http');
                return (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="tg-legend-row flex min-w-0 items-center gap-3 border border-line px-3 py-2"
                    >
                      <Icon
                        className="size-4 flex-none text-legend"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="tg-label block">{label}</span>
                        <span className="block truncate text-[0.85rem]">
                          {text}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </TrailLayout>
  );
}
