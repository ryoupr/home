/**
 * 公開している WEB ツールの一覧。
 * トップページの「TOOLS（凡例）」で使う。ツールを追加したら、ここと App.tsx のルートを更新する。
 */
export type ToolSymbol = 'chart' | 'icon' | 'chevron' | 'slide' | 'convert';

export interface ToolEntry {
  path: string;
  name: string;
  description: string;
  symbol: ToolSymbol;
}

export const TOOLS: readonly ToolEntry[] = [
  {
    path: '/tools/csv-graph-viewer',
    name: 'CSV Graph Viewer',
    description:
      'CSV から棒・折れ線・面グラフを作成。目標ラインやエリアも追加できます。',
    symbol: 'chart',
  },
  {
    path: '/tools/icon-generator',
    name: 'Icon Generator',
    description: 'アイコンや文字から、1024×1024 の PNG アイコンを作成します。',
    symbol: 'icon',
  },
  {
    path: '/tools/yabane-schedule',
    name: '矢羽スケジュール',
    description:
      '矢羽形のガントチャートを作成。祝日対応で、PowerPoint に書き出せます。',
    symbol: 'chevron',
  },
  {
    path: '/tools/slide-builder',
    name: 'Slide Builder',
    description:
      'HTML のスライドを、要素ごとに編集できる PowerPoint ファイルに変換します。',
    symbol: 'slide',
  },
  {
    path: '/tools/boxnote-converter',
    name: 'BoxNote → Markdown',
    description:
      'Box Notes の .boxnote ファイルを、書式を保ったまま Markdown に変換します。',
    symbol: 'convert',
  },
];
