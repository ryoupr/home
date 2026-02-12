// BoxNote JSON → Markdown converter

interface BoxNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: BoxNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

function renderMarks(text: string, marks?: BoxNode['marks']): string {
  if (!marks) return text;
  let r = text;
  for (const m of marks) {
    if (m.type === 'strong') r = `**${r}**`;
    else if (m.type === 'strikethrough') r = `~~${r}~~`;
    else if (m.type === 'code') r = `\`${r}\``;
    else if (m.type === 'link') r = `[${r}](${m.attrs?.href ?? ''})`;
  }
  return r;
}

function renderInline(nodes?: BoxNode[]): string {
  if (!nodes) return '';
  return nodes
    .map((n) => {
      if (n.type === 'text') return renderMarks(n.text ?? '', n.marks);
      if (n.type === 'hard_break') return '\n';
      if (n.type === 'image')
        return `![${n.attrs?.alt ?? ''}](${n.attrs?.src ?? ''})`;
      return '';
    })
    .join('');
}

function renderTable(node: BoxNode): string {
  const rows = (node.content ?? []).filter((r) => r.type === 'table_row');
  if (rows.length === 0) return '';
  const matrix = rows.map((row) =>
    (row.content ?? []).map((cell) => {
      const text = (cell.content ?? [])
        .map((c) => renderInline(c.content))
        .join(' ')
        .replace(/\n/g, ' ')
        .trim();
      return text;
    })
  );
  const cols = Math.max(...matrix.map((r) => r.length));
  const pad = (arr: string[]) => {
    while (arr.length < cols) arr.push('');
    return arr;
  };
  const lines: string[] = [];
  lines.push(`| ${pad(matrix[0]).join(' | ')} |`);
  lines.push(`| ${Array(cols).fill('---').join(' | ')} |`);
  for (let i = 1; i < matrix.length; i++) {
    lines.push(`| ${pad(matrix[i]).join(' | ')} |`);
  }
  return lines.join('\n') + '\n';
}

function renderBlock(node: BoxNode, indent = 0): string {
  const pfx = '  '.repeat(indent);
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map((c) => renderBlock(c)).join('\n');
    case 'heading': {
      const lvl = (node.attrs?.level as number) ?? 1;
      const t = renderInline(node.content);
      return t ? `${'#'.repeat(lvl)} ${t}\n` : '';
    }
    case 'paragraph': {
      const t = renderInline(node.content);
      return `${pfx}${t}\n`;
    }
    case 'bullet_list':
    case 'ordered_list':
      return (node.content ?? []).map((c) => renderBlock(c, indent)).join('');
    case 'list_item': {
      const parts: string[] = [];
      for (const child of node.content ?? []) {
        if (child.type === 'paragraph')
          parts.push(`${pfx}- ${renderInline(child.content).trim()}`);
        else if (
          child.type === 'bullet_list' ||
          child.type === 'ordered_list'
        )
          parts.push(renderBlock(child, indent + 1));
        else parts.push(renderBlock(child, indent + 1));
      }
      return parts.join('\n') + '\n';
    }
    case 'table':
      return renderTable(node) + '\n';
    case 'code_block': {
      const lang = (node.attrs?.language as string) ?? '';
      return `\`\`\`${lang}\n${renderInline(node.content)}\n\`\`\`\n`;
    }
    case 'blockquote': {
      const inner = (node.content ?? []).map((c) => renderBlock(c)).join('');
      return (
        inner
          .split('\n')
          .map((l) => (l ? `> ${l}` : '>'))
          .join('\n') + '\n'
      );
    }
    case 'horizontal_rule':
      return '---\n';
    default:
      return (node.content ?? []).map((c) => renderBlock(c, indent)).join('');
  }
}

export function convertBoxNoteToMarkdown(json: string): string {
  const parsed = JSON.parse(json) as { doc?: BoxNode } & BoxNode;
  const doc = parsed.doc ?? parsed;
  const raw = renderBlock(doc);
  // collapse 3+ consecutive blank lines into 2
  return raw.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
