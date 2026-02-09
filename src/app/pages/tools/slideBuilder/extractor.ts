import { SLIDE_W, SLIDE_H, PX_TO_PT, MIN_CONTAINER_W, MIN_CONTAINER_H, MAX_ELEMENTS, type SlideElement, type Pos } from './types';
import { rgbToHex, isTransparent, parseGradient, parseBoxShadow, parseRotation, svgToDataUri, applyTextTransform, extractRichText } from './utils';

function extractPseudo(el: HTMLElement, pseudo: '::before' | '::after', p: Pos, zIndex: number, domOrder: number, scaleX: number, scaleY: number): SlideElement | null {
  const ps = getComputedStyle(el, pseudo);
  const content = ps.content;
  if (!content || content === 'none' || content === 'normal' || content === '""') return null;
  if (/^(counter|attr|url|open-quote|close-quote)\(/.test(content)) return null;

  const text = content.replace(/^["']|["']$/g, '');
  const psWidth = parseFloat(ps.width);
  const psHeight = parseFloat(ps.height);
  const fontSize = parseFloat(ps.fontSize) * PX_TO_PT;
  const w = (!isNaN(psWidth) && psWidth > 0) ? psWidth * scaleX : text ? Math.max(text.length * fontSize * 0.8 / 72, 0.1) : 0;
  const h = (!isNaN(psHeight) && psHeight > 0) ? psHeight * scaleY : fontSize * 1.4 / 72;
  if (w < 0.01 && h < 0.01) return null;

  const bgColor = !isTransparent(ps.backgroundColor) ? rgbToHex(ps.backgroundColor) : undefined;
  const x = pseudo === '::before' ? p.x - w : p.x + p.w;
  const y = p.y;

  if (text && text.trim()) {
    return {
      type: 'text', x, y, w: Math.max(w, 0.1), h: Math.max(h, 0.1), zIndex, domOrder,
      text, fontSize, fontColor: rgbToHex(ps.color) || '333333',
      fontFamily: ps.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontBold: parseInt(ps.fontWeight) >= 700,
    };
  }
  if (bgColor && w > 0.01 && h > 0.01) {
    return { type: 'shape', x, y, w, h, zIndex, domOrder, fill: bgColor };
  }
  return null;
}

function revealHiddenSlides(doc: Document): void {
  const children = Array.from(doc.body.children) as HTMLElement[];
  const groups = new Map<string, HTMLElement[]>();
  for (const el of children) {
    const key = el.tagName + '.' + Array.from(el.classList).sort().join('.');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(el);
  }
  for (const [, els] of groups) {
    if (els.length < 2) continue;
    const hidden = els.filter(el => getComputedStyle(el).display === 'none');
    if (hidden.length === 0 || hidden.length === els.length) continue;
    const visible = els.find(el => getComputedStyle(el).display !== 'none');
    if (!visible || visible.offsetWidth < MIN_CONTAINER_W || visible.offsetHeight < MIN_CONTAINER_H) continue;
    const style = getComputedStyle(visible);
    for (const el of hidden) {
      el.style.display = style.display || 'flex';
      el.style.width = visible.offsetWidth + 'px';
      el.style.height = visible.offsetHeight + 'px';
      el.style.position = 'relative';
    }
  }
}

function extractFromContainer(container: HTMLElement): SlideElement[] {
  const cRect = container.getBoundingClientRect();
  const scaleX = SLIDE_W / cRect.width;
  const scaleY = SLIDE_H / cRect.height;
  const elements: SlideElement[] = [];
  const textOwners = new WeakSet<Node>();
  let order = 0;

  function pos(rect: DOMRect) {
    return { x: (rect.left - cRect.left) * scaleX, y: (rect.top - cRect.top) * scaleY, w: rect.width * scaleX, h: rect.height * scaleY };
  }

  function walk(el: HTMLElement, depth: number) {
    if (elements.length >= MAX_ELEMENTS) return;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (rect.width < 1 || rect.height < 1) return;
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const p = pos(rect);
    if (p.x + p.w < 0 || p.y + p.h < 0 || p.x > SLIDE_W || p.y > SLIDE_H) return;

    const parsed = parseInt(style.zIndex);
    const zIndex = isNaN(parsed) ? 0 : parsed;
    const domOrder = order++;
    const opacity = parseFloat(style.opacity);
    const rotate = parseRotation(style.transform);
    const shadowData = parseBoxShadow(style.boxShadow);
    const common = { ...p, zIndex, domOrder, opacity: opacity < 1 ? opacity : undefined, rotate: rotate || undefined, shadow: shadowData || undefined };

    const before = extractPseudo(el, '::before', p, zIndex, domOrder, scaleX, scaleY);
    if (before) elements.push(before);
    const after = extractPseudo(el, '::after', p, zIndex, domOrder, scaleX, scaleY);
    if (after) elements.push(after);

    if (el.tagName === 'svg' || el instanceof SVGElement) {
      const uri = svgToDataUri(el as SVGElement);
      if (uri) elements.push({ type: 'image', ...common, imgSrc: uri });
      return;
    }

    if (el.tagName === 'CANVAS') {
      try {
        const uri = (el as HTMLCanvasElement).toDataURL('image/png');
        if (uri) elements.push({ type: 'image', ...common, imgSrc: uri });
      } catch (e) { console.warn('Canvas export failed:', e); }
      return;
    }

    if (el.tagName === 'TABLE') {
      const trs = Array.from(el.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr'));
      if (!trs.length) return;
      const occupied = new Map<string, string>();
      const numRows = trs.length;
      let maxCols = 0;
      trs.forEach((tr, ri) => {
        let ci = 0;
        tr.querySelectorAll(':scope > th, :scope > td').forEach(td => {
          while (occupied.has(`${ri},${ci}`)) ci++;
          const cell = td as HTMLTableCellElement;
          const cs = Math.max(1, cell.colSpan || 1);
          const rs = Math.max(1, cell.rowSpan || 1);
          const text = cell.innerText.trim();
          for (let r = 0; r < rs; r++)
            for (let c = 0; c < cs; c++)
              occupied.set(`${ri + r},${ci + c}`, (r === 0 && c === 0) ? text : '');
          ci += cs;
        });
        maxCols = Math.max(maxCols, ci);
      });
      const grid: string[][] = [];
      for (let ri = 0; ri < numRows; ri++) {
        const row: string[] = [];
        for (let ci = 0; ci < maxCols; ci++) row.push(occupied.get(`${ri},${ci}`) ?? '');
        grid.push(row);
      }
      if (grid.length) elements.push({ type: 'table', ...common, tableRows: grid, fontSize: parseFloat(style.fontSize) * PX_TO_PT, fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim() });
      return;
    }

    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const bullets: SlideElement['bullets'] = [];
      function walkList(list: HTMLElement, level: number) {
        for (const li of Array.from(list.querySelectorAll(':scope > li'))) {
          const liEl = li as HTMLElement;
          const liStyle = getComputedStyle(liEl);
          const liText = Array.from(liEl.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !(n as HTMLElement).matches?.('ul, ol')))
            .map(n => n.textContent?.trim()).filter(Boolean).join(' ');
          if (liText) {
            bullets.push({ text: liText, indentLevel: level, bold: parseInt(liStyle.fontWeight) >= 700, fontSize: parseFloat(liStyle.fontSize) * PX_TO_PT, color: rgbToHex(liStyle.color) || '333333' });
          }
          const nested = liEl.querySelector(':scope > ul, :scope > ol');
          if (nested) walkList(nested as HTMLElement, level + 1);
        }
      }
      walkList(el, 0);
      if (bullets.length) {
        elements.push({ type: 'list', ...common, bullets, listType: el.tagName === 'OL' ? 'number' : 'bullet', fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim() });
      }
      return;
    }

    const bg = style.backgroundColor;
    const bgImage = style.backgroundImage;
    const hasBg = !isTransparent(bg);
    const gradient = parseGradient(bgImage);
    const bgUrlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (bgUrlMatch && !gradient) elements.push({ type: 'image', ...common, imgSrc: bgUrlMatch[1] });

    const bTop = { w: parseFloat(style.borderTopWidth) || 0, c: style.borderTopColor };
    const bRight = { w: parseFloat(style.borderRightWidth) || 0, c: style.borderRightColor };
    const bBottom = { w: parseFloat(style.borderBottomWidth) || 0, c: style.borderBottomColor };
    const bLeft = { w: parseFloat(style.borderLeftWidth) || 0, c: style.borderLeftColor };
    const allSame = bTop.w === bRight.w && bTop.w === bBottom.w && bTop.w === bLeft.w && bTop.c === bRight.c && bTop.c === bBottom.c && bTop.c === bLeft.c;
    const hasBorder = [bTop, bRight, bBottom, bLeft].some(b => b.w > 0 && !isTransparent(b.c));
    const borderRadius = parseFloat(style.borderRadius) || 0;

    if (hasBg || hasBorder || gradient) {
      const elem: SlideElement = { type: 'shape', ...common };
      if (gradient) { elem.gradient = gradient; } else if (hasBg) { elem.fill = rgbToHex(bg) || undefined; }
      if (hasBorder && allSame) { elem.borderColor = rgbToHex(bTop.c) || undefined; elem.borderWidth = bTop.w; }
      else if (hasBorder && !allSame) { elem.borders = [bTop, bRight, bBottom, bLeft].map(b => ({ color: rgbToHex(b.c) || '000000', width: b.w })); }
      if (borderRadius > 0) elem.borderRadius = borderRadius * scaleX;
      elements.push(elem);
    }

    if (el.tagName === 'IMG') {
      const src = (el as HTMLImageElement).src;
      if (!src) return;
      const objectFit = style.objectFit;
      const parent = el.parentElement;
      const parentOverflow = parent ? getComputedStyle(parent).overflow : '';
      const isClipped = parentOverflow === 'hidden' || parentOverflow === 'clip';
      if (isClipped && parent) {
        const clipped = pos(parent.getBoundingClientRect());
        elements.push({ type: 'image', ...common, x: clipped.x, y: clipped.y, w: clipped.w, h: clipped.h, imgSrc: src, imgSizing: 'crop' });
      } else if (objectFit === 'cover' || objectFit === 'contain') {
        elements.push({ type: 'image', ...common, imgSrc: src, imgSizing: objectFit });
      } else {
        elements.push({ type: 'image', ...common, imgSrc: src });
      }
      return;
    }

    const rich = extractRichText(el, style);
    if (rich && rich.length > 0) {
      const fullText = rich.map(s => s.text).join('');
      if (fullText && !textOwners.has(el)) {
        textOwners.add(el);
        Array.from(el.childNodes).forEach(n => { if (n.nodeType === Node.TEXT_NODE) textOwners.add(n); });
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
      return;
    }

    for (const child of Array.from(el.children) as HTMLElement[]) walk(child, depth + 1);

    const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    const directText = textNodes.map(n => n.textContent?.trim()).filter(Boolean).join(' ');
    if (directText && !textNodes.some(n => textOwners.has(n))) {
      textNodes.forEach(n => textOwners.add(n));
      const fontSize = parseFloat(style.fontSize) * PX_TO_PT;
      const padT = parseFloat(style.paddingTop) * scaleY;
      const padR = parseFloat(style.paddingRight) * scaleX;
      const padB = parseFloat(style.paddingBottom) * scaleY;
      const padL = parseFloat(style.paddingLeft) * scaleX;
      const ls = parseFloat(style.letterSpacing);
      const textIndent = parseFloat(style.textIndent) * scaleX;
      const effectivePadL = padL + (textIndent > 0 ? textIndent : 0);
      const hasPadOrIndent = padT > 0.01 || padR > 0.01 || padB > 0.01 || effectivePadL > 0.01;
      elements.push({
        type: 'text', ...common, text: applyTextTransform(directText, style.textTransform),
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
        charSpacing: !isNaN(ls) && ls !== 0 ? ls * PX_TO_PT : undefined,
        padding: hasPadOrIndent ? { t: padT, r: padR, b: padB, l: effectivePadL } : undefined,
        hyperlink: el.tagName === 'A' ? (el as HTMLAnchorElement).href : undefined,
      });
    }
  }

  walk(container, 0);
  elements.sort((a, b) => a.zIndex !== b.zIndex ? a.zIndex - b.zIndex : a.domOrder - b.domOrder);
  return elements;
}

export function extractSlides(doc: Document): SlideElement[][] {
  if (!doc.body) return [[]];
  revealHiddenSlides(doc);

  const all = Array.from(doc.body.querySelectorAll('*')) as HTMLElement[];
  const containers: HTMLElement[] = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width >= MIN_CONTAINER_W && r.height >= MIN_CONTAINER_H) {
      const isChild = containers.some(c => c.contains(el) && c !== el);
      if (!isChild) {
        for (let i = containers.length - 1; i >= 0; i--) {
          if (el.contains(containers[i])) containers.splice(i, 1);
        }
        containers.push(el);
      }
    }
  }
  if (containers.length === 0) containers.push(doc.body);
  return containers.map(container => extractFromContainer(container));
}
