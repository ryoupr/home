/** Color helpers and CSS parsers for SlideBuilder. */

import {
  MAX_CSS_LEN,
  PX_TO_PT,
  type RichTextSegment,
} from './slideBuilderTypes';

export function rgbToHex(rgb: string): string | null {
  if (rgb.length > MAX_CSS_LEN) return null;
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) < 0.05) return null;
  return [m[1], m[2], m[3]]
    .map((v) =>
      Math.min(255, Math.max(0, Number(v)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
    .toUpperCase();
}

export function isTransparent(color: string): boolean {
  return !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export function parseGradient(
  bg: string
): { angle: number; color1: string; color2: string } | null {
  if (bg.length > MAX_CSS_LEN) return null;
  const m = bg.match(
    /linear-gradient\(\s*([\d.]+)deg\s*,\s*([^,]+),\s*([^)]+)\)/
  );
  if (!m) {
    const simple = bg.match(/linear-gradient\(\s*([^,]+),\s*([^)]+)\)/);
    if (!simple) return null;
    const c1 =
      rgbToHex(simple[1]) || simple[1].trim().replace('#', '').toUpperCase();
    const c2 =
      rgbToHex(simple[2]) || simple[2].trim().replace('#', '').toUpperCase();
    return {
      angle: 180,
      color1: c1.substring(0, 6),
      color2: c2.substring(0, 6),
    };
  }
  const angle = parseFloat(m[1]);
  const c1 =
    rgbToHex(m[2]) ||
    m[2]
      .trim()
      .replace(/#|\s+\d+%/g, '')
      .toUpperCase();
  const c2 =
    rgbToHex(m[3]) ||
    m[3]
      .trim()
      .replace(/#|\s+\d+%/g, '')
      .toUpperCase();
  return { angle, color1: c1.substring(0, 6), color2: c2.substring(0, 6) };
}

export function parseBoxShadow(shadow: string): {
  blur: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
} | null {
  if (!shadow || shadow === 'none') return null;
  const parts = shadow.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/);
  if (!parts) return null;
  const colorMatch = shadow.match(/rgba?\([^)]+\)/);
  const color = colorMatch ? rgbToHex(colorMatch[0]) || '000000' : '000000';
  const opacityMatch = shadow.match(/,\s*([\d.]+)\)/);
  return {
    offsetX: parseFloat(parts[1]),
    offsetY: parseFloat(parts[2]),
    blur: parseFloat(parts[3]),
    color,
    opacity: opacityMatch ? parseFloat(opacityMatch[1]) : 0.3,
  };
}

export function parseRotation(transform: string): number {
  const m = transform.match(/rotate\(([-\d.]+)deg\)/);
  return m ? parseFloat(m[1]) : 0;
}

export function svgToDataUri(el: SVGElement): string | null {
  try {
    const s = new XMLSerializer().serializeToString(el);
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));
  } catch (e) {
    console.warn('svgToDataUri failed:', e);
    return null;
  }
}

export function applyTextTransform(text: string, transform: string): string {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize')
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  return text;
}

export const INLINE_TAGS = new Set([
  'SPAN',
  'A',
  'STRONG',
  'EM',
  'B',
  'I',
  'U',
  'S',
  'DEL',
  'MARK',
  'CODE',
  'SUB',
  'SUP',
]);

export function extractRichText(
  el: HTMLElement,
  parentStyle: CSSStyleDeclaration
): RichTextSegment[] | null {
  const children = Array.from(el.childNodes);
  const hasInline = children.some(
    (n) =>
      n.nodeType === Node.ELEMENT_NODE &&
      (INLINE_TAGS.has((n as HTMLElement).tagName) ||
        (n as HTMLElement).tagName === 'BR')
  );
  if (!hasInline) return null;

  const segments: RichTextSegment[] = [];
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent?.trim();
      if (t)
        segments.push({
          text: applyTextTransform(t, parentStyle.textTransform),
          bold: parseInt(parentStyle.fontWeight) >= 700,
          italic: parentStyle.fontStyle === 'italic',
          underline: parentStyle.textDecorationLine.includes('underline'),
          strike: parentStyle.textDecorationLine.includes('line-through'),
          fontSize: parseFloat(parentStyle.fontSize) * PX_TO_PT,
          color: rgbToHex(parentStyle.color) || '333333',
          fontFamily: parentStyle.fontFamily
            .split(',')[0]
            .replace(/['"]/g, '')
            .trim(),
        });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const ce = child as HTMLElement;
      if (ce.tagName === 'BR') {
        if (segments.length > 0) {
          segments[segments.length - 1].breakAfter = true;
        } else {
          segments.push({
            text: '',
            breakAfter: true,
            fontSize: parseFloat(parentStyle.fontSize) * PX_TO_PT,
            color: rgbToHex(parentStyle.color) || '333333',
          });
        }
        continue;
      }
      const cs = getComputedStyle(ce);
      const t = ce.innerText?.trim();
      if (t)
        segments.push({
          text: applyTextTransform(t, cs.textTransform),
          bold: parseInt(cs.fontWeight) >= 700,
          italic: cs.fontStyle === 'italic',
          underline: cs.textDecorationLine.includes('underline'),
          strike: cs.textDecorationLine.includes('line-through'),
          fontSize: parseFloat(cs.fontSize) * PX_TO_PT,
          color: rgbToHex(cs.color) || '333333',
          fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
          hyperlink:
            ce.tagName === 'A' ? (ce as HTMLAnchorElement).href : undefined,
        });
    }
  }
  return segments.length > 0 ? segments : null;
}
