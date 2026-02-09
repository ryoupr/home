import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Code, Loader2, X } from 'lucide-react';

declare global {
  interface Window { PptxGenJS?: new () => any; }
}

const PPTX_CDN = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// --- Color helpers ---
function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [, r, g, b] = m.map(Number);
  if (rgb.includes('rgba') && rgb.match(/,\s*([\d.]+)\)/) && parseFloat(rgb.match(/,\s*([\d.]+)\)/)![1]) < 0.05) return null;
  return [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function isTransparent(color: string): boolean {
  return !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

// --- CSS parsers ---
function parseGradient(bg: string): { angle: number; color1: string; color2: string } | null {
  const m = bg.match(/linear-gradient\(\s*([\d.]+)deg\s*,\s*([^,]+),\s*([^)]+)\)/);
  if (!m) {
    const simple = bg.match(/linear-gradient\(\s*([^,]+),\s*([^)]+)\)/);
    if (!simple) return null;
    const c1 = rgbToHex(simple[1]) || simple[1].trim().replace('#', '').toUpperCase();
    const c2 = rgbToHex(simple[2]) || simple[2].trim().replace('#', '').toUpperCase();
    return { angle: 180, color1: c1.substring(0, 6), color2: c2.substring(0, 6) };
  }
  const angle = parseFloat(m[1]);
  const c1 = rgbToHex(m[2]) || m[2].trim().replace(/#|\s+\d+%/g, '').toUpperCase();
  const c2 = rgbToHex(m[3]) || m[3].trim().replace(/#|\s+\d+%/g, '').toUpperCase();
  return { angle, color1: c1.substring(0, 6), color2: c2.substring(0, 6) };
}

function parseBoxShadow(shadow: string): { blur: number; offsetX: number; offsetY: number; color: string; opacity: number } | null {
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

function parseRotation(transform: string): number {
  const m = transform.match(/rotate\(([-\d.]+)deg\)/);
  return m ? parseFloat(m[1]) : 0;
}

function svgToDataUri(el: SVGElement): string | null {
  try {
    const s = new XMLSerializer().serializeToString(el);
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));
  } catch { return null; }
}

// --- Types ---
interface RichTextSegment {
  text: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean;
  fontSize?: number; color?: string; fontFamily?: string; hyperlink?: string;
  breakAfter?: boolean;
}

interface SlideElement {
  type: 'shape' | 'text' | 'image' | 'list' | 'table';
  x: number; y: number; w: number; h: number;
  zIndex: number;
  fill?: string;
  gradient?: { angle: number; color1: string; color2: string };
  opacity?: number;
  borderColor?: string; borderWidth?: number; borderRadius?: number;
  borders?: { color: string; width: number }[];
  shadow?: { blur: number; offsetX: number; offsetY: number; color: string; opacity: number };
  rotate?: number;
  padding?: { t: number; r: number; b: number; l: number };
  text?: string; fontSize?: number; fontBold?: boolean; fontItalic?: boolean;
  fontUnderline?: boolean; fontStrike?: boolean; fontColor?: string;
  fontFamily?: string; align?: string; valign?: string;
  charSpacing?: number; lineHeight?: number; hyperlink?: string;
  richText?: RichTextSegment[];
  bullets?: { text: string; bold: boolean; fontSize: number; color: string; indentLevel?: number }[];
  listType?: 'bullet' | 'number';
  tableRows?: string[][];
  imgSrc?: string;
}

// Inline tags that form rich text segments
const INLINE_TAGS = new Set(['SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'DEL', 'MARK', 'CODE', 'SUB', 'SUP']);

function applyTextTransform(text: string, transform: string): string {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') return text.replace(/\b\w/g, c => c.toUpperCase());
  return text;
}

function extractRichText(el: HTMLElement, parentStyle: CSSStyleDeclaration): RichTextSegment[] | null {
  const children = Array.from(el.childNodes);
  const hasInline = children.some(n =>
    (n.nodeType === Node.ELEMENT_NODE && (INLINE_TAGS.has((n as HTMLElement).tagName) || (n as HTMLElement).tagName === 'BR'))
  );
  if (!hasInline) return null;

  const segments: RichTextSegment[] = [];
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent?.trim();
      if (t) segments.push({
        text: applyTextTransform(t, parentStyle.textTransform),
        bold: parseInt(parentStyle.fontWeight) >= 700,
        italic: parentStyle.fontStyle === 'italic',
        underline: parentStyle.textDecorationLine.includes('underline'),
        strike: parentStyle.textDecorationLine.includes('line-through'),
        fontSize: parseFloat(parentStyle.fontSize) * 0.75,
        color: rgbToHex(parentStyle.color) || '333333',
        fontFamily: parentStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const ce = child as HTMLElement;
      // <br> → line break via breakAfter on previous segment
      if (ce.tagName === 'BR') {
        if (segments.length > 0) {
          segments[segments.length - 1].breakAfter = true;
        } else {
          segments.push({ text: '', breakAfter: true, fontSize: parseFloat(parentStyle.fontSize) * 0.75, color: rgbToHex(parentStyle.color) || '333333' });
        }
        continue;
      }
      const cs = getComputedStyle(ce);
      const t = ce.innerText?.trim();
      if (t) segments.push({
        text: applyTextTransform(t, cs.textTransform),
        bold: parseInt(cs.fontWeight) >= 700,
        italic: cs.fontStyle === 'italic',
        underline: cs.textDecorationLine.includes('underline'),
        strike: cs.textDecorationLine.includes('line-through'),
        fontSize: parseFloat(cs.fontSize) * 0.75,
        color: rgbToHex(cs.color) || '333333',
        fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        hyperlink: ce.tagName === 'A' ? (ce as HTMLAnchorElement).href : undefined,
      });
    }
  }
  return segments.length > 0 ? segments : null;
}

// Extract pseudo-element (::before/::after) as a shape or text
function extractPseudo(el: HTMLElement, pseudo: '::before' | '::after', p: ReturnType<typeof Object>, zIndex: number, scaleX: number, scaleY: number): SlideElement | null {
  const ps = getComputedStyle(el, pseudo);
  const content = ps.content;
  if (!content || content === 'none' || content === 'normal' || content === '""') return null;
  // #2: Skip function values (counter, attr, url, etc.)
  if (/^(counter|attr|url|open-quote|close-quote)\(/.test(content)) return null;

  const text = content.replace(/^["']|["']$/g, '');
  // #1: Use computed width/height from the pseudo-element style when available
  const psWidth = parseFloat(ps.width);
  const psHeight = parseFloat(ps.height);
  const fontSize = parseFloat(ps.fontSize) * 0.75;
  const w = (!isNaN(psWidth) && psWidth > 0) ? psWidth * scaleX : text ? Math.max(text.length * fontSize * 0.8 / 72, 0.1) : 0;
  const h = (!isNaN(psHeight) && psHeight > 0) ? psHeight * scaleY : fontSize * 1.4 / 72;
  if (w < 0.01 && h < 0.01) return null;

  const bgColor = !isTransparent(ps.backgroundColor) ? rgbToHex(ps.backgroundColor) : undefined;
  const x = pseudo === '::before' ? (p as any).x - w : (p as any).x + (p as any).w;
  const y = (p as any).y;

  if (text && text.trim()) {
    return {
      type: 'text', x, y, w: Math.max(w, 0.1), h: Math.max(h, 0.1), zIndex,
      text, fontSize, fontColor: rgbToHex(ps.color) || '333333',
      fontFamily: ps.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontBold: parseInt(ps.fontWeight) >= 700,
    };
  }
  if (bgColor && w > 0.01 && h > 0.01) {
    return { type: 'shape', x, y, w, h, zIndex, fill: bgColor };
  }
  return null;
}

// --- DOM extraction ---
function extractSlides(doc: Document): SlideElement[][] {
  if (!doc.body) return [[]];

  // Find all slide containers
  const all = Array.from(doc.body.querySelectorAll('*')) as HTMLElement[];
  const containers: HTMLElement[] = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width >= 800 && r.height >= 400) {
      // Don't add if a parent is already a container
      const isChild = containers.some(c => c.contains(el) && c !== el);
      if (!isChild) {
        // Remove any existing containers that are parents of this one
        for (let i = containers.length - 1; i >= 0; i--) {
          if (el.contains(containers[i])) containers.splice(i, 1);
        }
        containers.push(el);
      }
    }
  }
  // If multiple same-level siblings found, treat as multi-slide
  if (containers.length === 0) containers.push(doc.body);

  return containers.map(container => extractFromContainer(container));
}

function extractFromContainer(container: HTMLElement): SlideElement[] {
  const cRect = container.getBoundingClientRect();
  const scaleX = SLIDE_W / cRect.width;
  const scaleY = SLIDE_H / cRect.height;
  const elements: SlideElement[] = [];
  const textOwners = new WeakSet<Node>();
  let order = 0;

  function pos(rect: DOMRect) {
    return {
      x: (rect.left - cRect.left) * scaleX,
      y: (rect.top - cRect.top) * scaleY,
      w: rect.width * scaleX,
      h: rect.height * scaleY,
    };
  }

  function walk(el: HTMLElement, depth: number) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (rect.width < 1 || rect.height < 1) return;
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const p = pos(rect);
    if (p.x + p.w < 0 || p.y + p.h < 0 || p.x > SLIDE_W || p.y > SLIDE_H) return;

    const parsed = parseInt(style.zIndex);
    const zIndex = isNaN(parsed) ? order++ : parsed;
    const opacity = parseFloat(style.opacity);
    const rotate = parseRotation(style.transform);
    const shadowData = parseBoxShadow(style.boxShadow);

    // Common props
    const common = { ...p, zIndex, opacity: opacity < 1 ? opacity : undefined, rotate: rotate || undefined, shadow: shadowData || undefined };

    // ::before / ::after pseudo-elements
    const before = extractPseudo(el, '::before', p, zIndex, scaleX, scaleY);
    if (before) elements.push(before);
    const after = extractPseudo(el, '::after', p, zIndex, scaleX, scaleY);
    if (after) elements.push(after);

    // --- SVG ---
    if (el.tagName === 'svg' || el instanceof SVGElement) {
      const uri = svgToDataUri(el as SVGElement);
      if (uri) elements.push({ type: 'image', ...common, imgSrc: uri });
      return;
    }

    // --- CANVAS ---
    if (el.tagName === 'CANVAS') {
      try {
        const uri = (el as HTMLCanvasElement).toDataURL('image/png');
        if (uri) elements.push({ type: 'image', ...common, imgSrc: uri });
      } catch { /* tainted canvas */ }
      return;
    }

    // --- TABLE (with colspan/rowspan) ---
    if (el.tagName === 'TABLE') {
      const trs = Array.from(el.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr'));
      if (!trs.length) return;
      // #4: Pre-scan to determine grid size including rowspan expansion
      const occupied = new Map<string, string>();
      const numRows = trs.length;
      let maxCols = 0;

      // First pass: calculate occupied cells and max columns
      trs.forEach((tr, ri) => {
        let ci = 0;
        tr.querySelectorAll(':scope > th, :scope > td').forEach(td => {
          while (occupied.has(`${ri},${ci}`)) ci++;
          const cell = td as HTMLTableCellElement;
          const cs = cell.colSpan || 1;
          const rs = cell.rowSpan || 1;
          const text = cell.innerText.trim();
          // #5: Mark all spanned cells with the text (primary cell) or empty (spanned)
          for (let r = 0; r < rs; r++)
            for (let c = 0; c < cs; c++)
              occupied.set(`${ri + r},${ci + c}`, (r === 0 && c === 0) ? text : '');
          ci += cs;
        });
        maxCols = Math.max(maxCols, ci);
      });

      // Build grid from occupied map
      const grid: string[][] = [];
      for (let ri = 0; ri < numRows; ri++) {
        const row: string[] = [];
        for (let ci = 0; ci < maxCols; ci++) {
          row.push(occupied.get(`${ri},${ci}`) ?? '');
        }
        grid.push(row);
      }
      if (grid.length) elements.push({ type: 'table', ...common, tableRows: grid, fontSize: parseFloat(style.fontSize) * 0.75, fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim() });
      return;
    }

    // --- UL/OL (list with nesting) ---
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const bullets: SlideElement['bullets'] = [];
      function walkList(list: HTMLElement, level: number) {
        for (const li of Array.from(list.querySelectorAll(':scope > li'))) {
          const liEl = li as HTMLElement;
          const liStyle = getComputedStyle(liEl);
          // Get direct text (exclude nested list text)
          const liText = Array.from(liEl.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !(n as HTMLElement).matches?.('ul, ol')))
            .map(n => n.textContent?.trim()).filter(Boolean).join(' ');
          if (liText) {
            bullets.push({
              text: liText, indentLevel: level,
              bold: parseInt(liStyle.fontWeight) >= 700,
              fontSize: parseFloat(liStyle.fontSize) * 0.75,
              color: rgbToHex(liStyle.color) || '333333',
            });
          }
          // Nested lists
          const nested = liEl.querySelector(':scope > ul, :scope > ol');
          if (nested) walkList(nested as HTMLElement, level + 1);
        }
      }
      walkList(el, 0);
      if (bullets.length) {
        elements.push({
          type: 'list', ...common, bullets,
          listType: el.tagName === 'OL' ? 'number' : 'bullet',
          fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        });
      }
      return;
    }

    // --- Shape (background/border/background-image) ---
    const bg = style.backgroundColor;
    const bgImage = style.backgroundImage;
    const hasBg = !isTransparent(bg);
    const gradient = parseGradient(bgImage);

    // Background image (url)
    const bgUrlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (bgUrlMatch && !gradient) {
      elements.push({ type: 'image', ...common, imgSrc: bgUrlMatch[1] });
    }

    // Per-side borders
    const bTop = { w: parseFloat(style.borderTopWidth) || 0, c: style.borderTopColor };
    const bRight = { w: parseFloat(style.borderRightWidth) || 0, c: style.borderRightColor };
    const bBottom = { w: parseFloat(style.borderBottomWidth) || 0, c: style.borderBottomColor };
    const bLeft = { w: parseFloat(style.borderLeftWidth) || 0, c: style.borderLeftColor };
    const allSame = bTop.w === bRight.w && bTop.w === bBottom.w && bTop.w === bLeft.w && bTop.c === bRight.c && bTop.c === bBottom.c && bTop.c === bLeft.c;
    const hasBorder = [bTop, bRight, bBottom, bLeft].some(b => b.w > 0 && !isTransparent(b.c));
    const borderRadius = parseFloat(style.borderRadius) || 0;

    if (hasBg || hasBorder || gradient) {
      const elem: SlideElement = { type: 'shape', ...common };
      if (gradient) {
        elem.gradient = gradient;
      } else if (hasBg) {
        elem.fill = rgbToHex(bg) || undefined;
      }
      if (hasBorder && allSame) {
        elem.borderColor = rgbToHex(bTop.c) || undefined;
        elem.borderWidth = bTop.w;
      } else if (hasBorder && !allSame) {
        elem.borders = [bTop, bRight, bBottom, bLeft].map(b => ({
          color: rgbToHex(b.c) || '000000', width: b.w,
        }));
      }
      if (borderRadius > 0) elem.borderRadius = borderRadius * scaleX;
      elements.push(elem);
    }

    // --- IMG ---
    if (el.tagName === 'IMG') {
      const src = (el as HTMLImageElement).src;
      if (src) elements.push({ type: 'image', ...common, imgSrc: src });
      return;
    }

    // --- Text (rich text or plain) ---
    // Try rich text first (inline children with different styles)
    const rich = extractRichText(el, style);
    if (rich && rich.length > 0) {
      const fullText = rich.map(s => s.text).join('');
      if (fullText && !textOwners.has(el)) {
        textOwners.add(el);
        const padT = parseFloat(style.paddingTop) * scaleY;
        const padR = parseFloat(style.paddingRight) * scaleX;
        const padB = parseFloat(style.paddingBottom) * scaleY;
        const padL = parseFloat(style.paddingLeft) * scaleX;
        const hasPad = padT > 0.01 || padR > 0.01 || padB > 0.01 || padL > 0.01;
        elements.push({
          type: 'text', ...common, richText: rich,
          fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
          align: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'right' : 'left',
          valign: style.display === 'flex' && style.alignItems === 'center' ? 'middle' : 'top',
          lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize) || 1.4,
          padding: hasPad ? { t: padT, r: padR, b: padB, l: padL } : undefined,
        });
      }
      return; // Don't recurse into inline children
    }

    // Recurse children first
    for (const child of Array.from(el.children) as HTMLElement[]) {
      walk(child, depth + 1);
    }

    // Plain text (direct text nodes only)
    const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    const directText = textNodes.map(n => n.textContent?.trim()).filter(Boolean).join(' ');

    if (directText && !textNodes.some(n => textOwners.has(n))) {
      textNodes.forEach(n => textOwners.add(n));
      const fontSize = parseFloat(style.fontSize) * 0.75;
      const padT = parseFloat(style.paddingTop) * scaleY;
      const padR = parseFloat(style.paddingRight) * scaleX;
      const padB = parseFloat(style.paddingBottom) * scaleY;
      const padL = parseFloat(style.paddingLeft) * scaleX;
      const hasPad = padT > 0.01 || padR > 0.01 || padB > 0.01 || padL > 0.01;
      const ls = parseFloat(style.letterSpacing);
      const textIndent = parseFloat(style.textIndent) * scaleX;
      const effectivePadL = padL + (textIndent > 0 ? textIndent : 0);
      const hasPadOrIndent = padT > 0.01 || padR > 0.01 || padB > 0.01 || effectivePadL > 0.01;
      const transformed = applyTextTransform(directText, style.textTransform);

      elements.push({
        type: 'text', ...common,
        text: transformed,
        fontSize: Math.max(6, Math.min(72, fontSize)),
        fontBold: parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold',
        fontItalic: style.fontStyle === 'italic',
        fontUnderline: style.textDecorationLine.includes('underline'),
        fontStrike: style.textDecorationLine.includes('line-through'),
        fontColor: rgbToHex(style.color) || '333333',
        fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        align: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'right' : 'left',
        valign: style.display === 'flex' && style.alignItems === 'center' ? 'middle' : 'top',
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize) || 1.4,
        charSpacing: !isNaN(ls) && ls !== 0 ? ls * 0.75 : undefined,
        padding: hasPadOrIndent ? { t: padT, r: padR, b: padB, l: effectivePadL } : undefined,
        hyperlink: el.tagName === 'A' ? (el as HTMLAnchorElement).href : undefined,
      });
    }
  }

  walk(container, 0);
  elements.sort((a, b) => a.zIndex - b.zIndex);
  return elements;
}

// --- PPTX generation ---
function generatePptx(slides: SlideElement[][], filename: string) {
  const pptx = new window.PptxGenJS!();
  pptx.defineLayout({ name: 'WIDE', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'WIDE';

  for (const elements of slides) {
    const slide = pptx.addSlide();

    for (const el of elements) {
      const p = { x: el.x, y: el.y, w: el.w, h: el.h };
      const transparency = el.opacity != null ? Math.round((1 - el.opacity) * 100) : undefined;
      const rotOpt = el.rotate ? { rotate: el.rotate } : {};
      const shadowOpt = el.shadow ? {
        shadow: { type: 'outer', blur: el.shadow.blur * 0.75, offset: Math.max(Math.abs(el.shadow.offsetX), Math.abs(el.shadow.offsetY)) * 0.75, angle: Math.atan2(el.shadow.offsetY, el.shadow.offsetX) * 180 / Math.PI, color: el.shadow.color, opacity: el.shadow.opacity },
      } : {};

      if (el.type === 'shape') {
        const fill: any = el.gradient
          ? { type: 'gradient', color1: el.gradient.color1, color2: el.gradient.color2 }
          : el.fill ? { color: el.fill, transparency } : { type: 'none' };
        const lineOpt: any = el.borderColor
          ? { color: el.borderColor, width: Math.max(0.5, (el.borderWidth || 1) * 0.75) }
          : el.borders
            ? undefined // handled below
            : { type: 'none' };
        const opts: any = { ...p, ...rotOpt, ...shadowOpt, fill };
        if (lineOpt) opts.line = lineOpt;
        if (el.borderRadius && el.borderRadius > 0) {
          opts.rectRadius = Math.min(el.borderRadius, Math.min(el.w, el.h) / 2);
        }
        slide.addShape('rect', opts);

        // Per-side borders as separate thin lines
        if (el.borders) {
          const sides = [
            { b: el.borders[0], x1: p.x, y1: p.y, x2: p.x + p.w, y2: p.y },           // top
            { b: el.borders[1], x1: p.x + p.w, y1: p.y, x2: p.x + p.w, y2: p.y + p.h }, // right
            { b: el.borders[2], x1: p.x, y1: p.y + p.h, x2: p.x + p.w, y2: p.y + p.h }, // bottom
            { b: el.borders[3], x1: p.x, y1: p.y, x2: p.x, y2: p.y + p.h },             // left
          ];
          for (const s of sides) {
            if (s.b.width > 0) {
              slide.addShape('line', { x: s.x1, y: s.y1, w: s.x2 - s.x1 || 0.001, h: s.y2 - s.y1 || 0.001, line: { color: s.b.color, width: s.b.width * 0.75 } });
            }
          }
        }
      }

      if (el.type === 'text') {
        const margin = el.padding ? [el.padding.t * 72, el.padding.r * 72, el.padding.b * 72, el.padding.l * 72] : undefined;
        const baseOpts: any = {
          ...p, ...rotOpt, ...shadowOpt,
          align: el.align || 'left', valign: el.valign || 'top',
          wrap: true, lineSpacingMultiple: el.lineHeight || 1.4, margin, transparency,
        };

        if (el.richText && el.richText.length > 0) {
          // Rich text: array of segments
          const segments = el.richText.map(seg => ({
            text: seg.text,
            options: {
              fontSize: seg.fontSize || 12,
              bold: seg.bold || false,
              italic: seg.italic || false,
              underline: seg.underline ? { style: 'sng' as const } : undefined,
              strike: seg.strike ? 'sngStrike' as const : undefined,
              color: seg.color || '333333',
              fontFace: seg.fontFamily || el.fontFamily || 'Yu Gothic',
              hyperlink: seg.hyperlink ? { url: seg.hyperlink } : undefined,
              breakLine: seg.breakAfter || false,
            },
          }));
          slide.addText(segments, baseOpts);
        } else if (el.text) {
          slide.addText(el.text, {
            ...baseOpts,
            fontSize: el.fontSize || 12,
            bold: el.fontBold || false,
            italic: el.fontItalic || false,
            underline: el.fontUnderline ? { style: 'sng' as const } : undefined,
            strike: el.fontStrike ? 'sngStrike' as const : undefined,
            color: el.fontColor || '333333',
            fontFace: el.fontFamily || 'Yu Gothic',
            charSpacing: el.charSpacing,
            hyperlink: el.hyperlink ? { url: el.hyperlink } : undefined,
          });
        }
      }

      if (el.type === 'list' && el.bullets?.length) {
        const rows = el.bullets.map(b => ({
          text: b.text,
          options: {
            fontSize: b.fontSize || 12,
            bold: b.bold,
            color: b.color || '333333',
            fontFace: el.fontFamily || 'Yu Gothic',
            bullet: el.listType === 'number' ? { type: 'number' } : true,
            indentLevel: b.indentLevel || 0,
          },
        }));
        slide.addText(rows, { ...p, ...rotOpt, wrap: true, valign: 'top', transparency });
      }

      if (el.type === 'table' && el.tableRows?.length) {
        const rows = el.tableRows.map((row, ri) =>
          row.map(cell => ({
            text: cell,
            options: {
              fontSize: el.fontSize || 10,
              fontFace: el.fontFamily || 'Yu Gothic',
              bold: ri === 0,
              fill: ri === 0 ? { color: 'E8E8E8' } : undefined,
              border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
            },
          }))
        );
        slide.addTable(rows, { ...p, autoPage: false });
      }

      if (el.type === 'image' && el.imgSrc) {
        try {
          if (el.imgSrc.startsWith('data:')) {
            slide.addImage({ data: el.imgSrc, ...p, ...rotOpt, transparency });
          } else {
            slide.addImage({ path: el.imgSrc, ...p, ...rotOpt, transparency });
          }
        } catch { /* skip */ }
      }
    }
  }

  pptx.writeFile({ fileName: filename });
}

// --- Default sample HTML ---
const SAMPLE_HTML = `<!DOCTYPE html>
<html><head><style>
body { margin: 0; font-family: sans-serif; }
.slide { width: 1280px; height: 720px; background: #fff; position: relative; padding: 60px; display: flex; flex-direction: column; }
.title { font-size: 36px; font-weight: bold; color: #1a1a1a; border-left: 8px solid #B21E35; padding-left: 20px; margin-bottom: 30px; }
.cards { display: flex; gap: 24px; flex: 1; }
.card { flex: 1; border: 1px solid #e2e2e2; border-top: 4px solid #B21E35; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card h3 { color: #B21E35; margin: 0 0 12px; font-size: 18px; }
.card p { color: #333; font-size: 14px; line-height: 1.6; margin: 0; }
.footer { margin-top: 30px; font-size: 12px; color: #999; text-align: right; }
</style></head><body>
<div class="slide">
  <div class="title">サンプルスライド</div>
  <div class="cards">
    <div class="card"><h3>項目1</h3><p>テキストを入力してください</p></div>
    <div class="card"><h3>項目2</h3><p>テキストを入力してください</p></div>
    <div class="card"><h3>項目3</h3><p>テキストを入力してください</p></div>
  </div>
  <div class="footer">© Sample Slide</div>
</div>
</body></html>`;

// --- Toast ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl">
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
    </div>
  );
}

// --- Component ---
export function SlideBuilderPage() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [showPreview, setShowPreview] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ slides: 0, elements: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  useEffect(() => { document.title = 'Slide Builder | ryoupr'; }, []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setPreviewScale(Math.min((width - 32) / 1280, 0.9));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [showPreview]);

  useEffect(() => {
    if (document.getElementById('pptxgenjs-cdn')) return;
    const s = document.createElement('script');
    s.id = 'pptxgenjs-cdn';
    s.src = PPTX_CDN;
    document.head.appendChild(s);
  }, []);

  const updateStats = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const slides = extractSlides(doc);
        setStats({ slides: slides.length, elements: slides.reduce((s, sl) => s + sl.length, 0) });
      }
    } catch { setStats({ slides: 0, elements: 0 }); }
  }, []);

  const onIframeLoad = useCallback(() => updateStats(), [updateStats]);

  useEffect(() => {
    const t = setTimeout(updateStats, 500);
    return () => clearTimeout(t);
  }, [html, updateStats]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleExport = useCallback(async () => {
    if (!window.PptxGenJS) { showToast('PptxGenJS を読み込み中...'); return; }
    const doc = iframeRef.current?.contentDocument;
    if (!doc) { showToast('プレビューが読み込まれていません'); return; }
    setExporting(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const slides = extractSlides(doc);
      generatePptx(slides, 'slide-output.pptx');
    } catch (e) {
      showToast('エクスポートエラー: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link to="/tools" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              ← ツール一覧に戻る
            </Link>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Slide Builder</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  HTMLスライドコードを貼り付けて、各要素が個別に編集可能なPPTXファイルを生成
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.elements > 0 && `${stats.slides}スライド / ${stats.elements}要素`}
                </span>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <button
                    onClick={() => setShowPreview(p => !p)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${showPreview ? 'bg-rose-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={showPreview}
                    aria-label="プレビュー表示の切り替え"
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${showPreview ? 'translate-x-5' : ''}`} />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors font-medium shadow-md"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PPTX ダウンロード
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`} style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                HTML コード
              </div>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                spellCheck={false}
                placeholder="HTMLスライドコードを貼り付けてください..."
              />
            </div>

            {showPreview && (
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                  プレビュー
                </div>
                <div ref={previewContainerRef} className="flex-1 overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-4">
                  <div style={{ width: 1280 * previewScale, height: 720 * previewScale, flexShrink: 0 }}>
                    <iframe
                      ref={iframeRef}
                      srcDoc={html}
                      onLoad={onIframeLoad}
                      className="bg-white shadow-lg"
                      style={{ width: 1280, height: 720, transform: `scale(${previewScale})`, transformOrigin: 'top left', border: 'none' }}
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
