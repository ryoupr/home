import { type GearProject, GearTag } from './GearTag';

const PER_ROW = 3;

/** レール（3件ごとに1本）にプロジェクトのタグを吊るしたギア棚 */
export function GearRack({
  projects,
  showGithub = false,
}: {
  projects: GearProject[];
  showGithub?: boolean;
}) {
  const rows: GearProject[][] = [];
  for (let i = 0; i < projects.length; i += PER_ROW) {
    rows.push(projects.slice(i, i + PER_ROW));
  }
  return (
    <div className="flex flex-col gap-8">
      {rows.map((row) => (
        <div key={row.map((p) => p.id).join('-')}>
          <div className="tg-rail" aria-hidden="true" />
          <ul className="grid gap-x-5 gap-y-2 md:grid-cols-3">
            {row.map((project) => (
              <li key={project.id} className="grid">
                <GearTag project={project} showGithub={showGithub} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
