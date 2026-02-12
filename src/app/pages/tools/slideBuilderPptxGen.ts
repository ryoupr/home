/** PPTX generation for SlideBuilder. */

import {
  PX_TO_PT,
  SLIDE_H,
  SLIDE_W,
  type SlideElement,
} from './slideBuilderTypes';

export function generatePptx(slides: SlideElement[][], filename: string) {
  if (!window.PptxGenJS) {
    throw new Error('PptxGenJS is not loaded');
  }
  const pptx = new window.PptxGenJS();
  pptx.defineLayout({ name: 'WIDE', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'WIDE';

  for (const elements of slides) {
    const slide = pptx.addSlide();

    for (const el of elements) {
      const p = { x: el.x, y: el.y, w: el.w, h: el.h };
      const transparency =
        el.opacity != null ? Math.round((1 - el.opacity) * 100) : undefined;
      const rotOpt = el.rotate ? { rotate: el.rotate } : {};
      const shadowOpt = el.shadow
        ? {
            shadow: {
              type: 'outer',
              blur: el.shadow.blur * PX_TO_PT,
              offset:
                Math.max(
                  Math.abs(el.shadow.offsetX),
                  Math.abs(el.shadow.offsetY)
                ) * PX_TO_PT,
              angle:
                (Math.atan2(el.shadow.offsetY, el.shadow.offsetX) * 180) /
                Math.PI,
              color: el.shadow.color,
              opacity: el.shadow.opacity,
            },
          }
        : {};

      if (el.type === 'shape') {
        const fill: Record<string, unknown> = el.gradient
          ? {
              type: 'gradient',
              color1: el.gradient.color1,
              color2: el.gradient.color2,
            }
          : el.fill
            ? { color: el.fill, transparency }
            : { type: 'none' };
        const lineOpt: Record<string, unknown> | undefined = el.borderColor
          ? {
              color: el.borderColor,
              width: Math.max(0.5, (el.borderWidth || 1) * PX_TO_PT),
            }
          : el.borders
            ? undefined
            : { type: 'none' };
        const opts: Record<string, unknown> = {
          ...p,
          ...rotOpt,
          ...shadowOpt,
          fill,
        };
        if (lineOpt) opts.line = lineOpt;
        if (el.borderRadius && el.borderRadius > 0) {
          opts.rectRadius = Math.min(el.borderRadius, Math.min(el.w, el.h) / 2);
        }
        slide.addShape('rect', opts);

        if (el.borders) {
          const sides = [
            { b: el.borders[0], x1: p.x, y1: p.y, x2: p.x + p.w, y2: p.y },
            {
              b: el.borders[1],
              x1: p.x + p.w,
              y1: p.y,
              x2: p.x + p.w,
              y2: p.y + p.h,
            },
            {
              b: el.borders[2],
              x1: p.x,
              y1: p.y + p.h,
              x2: p.x + p.w,
              y2: p.y + p.h,
            },
            { b: el.borders[3], x1: p.x, y1: p.y, x2: p.x, y2: p.y + p.h },
          ];
          for (const s of sides) {
            if (s.b.width > 0) {
              slide.addShape('line', {
                x: s.x1,
                y: s.y1,
                w: s.x2 - s.x1 || 0.001,
                h: s.y2 - s.y1 || 0.001,
                line: { color: s.b.color, width: s.b.width * PX_TO_PT },
              });
            }
          }
        }
      }

      if (el.type === 'text') {
        const margin = el.padding
          ? [
              el.padding.t * 72,
              el.padding.r * 72,
              el.padding.b * 72,
              el.padding.l * 72,
            ]
          : undefined;
        const baseOpts: Record<string, unknown> = {
          ...p,
          ...rotOpt,
          ...shadowOpt,
          align: el.align || 'left',
          valign: el.valign || 'top',
          wrap: true,
          lineSpacingMultiple: el.lineHeight || 1.4,
          margin,
          transparency,
        };

        if (el.richText && el.richText.length > 0) {
          const segments = el.richText.map((seg) => ({
            text: seg.text,
            options: {
              fontSize: seg.fontSize || 12,
              bold: seg.bold || false,
              italic: seg.italic || false,
              underline: seg.underline ? { style: 'sng' as const } : undefined,
              strike: seg.strike ? ('sngStrike' as const) : undefined,
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
            strike: el.fontStrike ? ('sngStrike' as const) : undefined,
            color: el.fontColor || '333333',
            fontFace: el.fontFamily || 'Yu Gothic',
            charSpacing: el.charSpacing,
            hyperlink: el.hyperlink ? { url: el.hyperlink } : undefined,
          });
        }
      }

      if (el.type === 'list' && el.bullets?.length) {
        const rows = el.bullets.map((b) => ({
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
        slide.addText(rows, {
          ...p,
          ...rotOpt,
          wrap: true,
          valign: 'top',
          transparency,
        });
      }

      if (el.type === 'table' && el.tableRows?.length) {
        const rows = el.tableRows.map((row, ri) =>
          row.map((cell) => ({
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
          const imgBase: Record<string, unknown> = {
            ...p,
            ...rotOpt,
            transparency,
          };
          if (el.imgSrc.startsWith('data:')) {
            imgBase.data = el.imgSrc;
          } else {
            imgBase.path = el.imgSrc;
          }
          if (el.imgSizing === 'crop' || el.imgSizing === 'cover') {
            imgBase.sizing = { type: 'cover', w: p.w, h: p.h };
          } else if (el.imgSizing === 'contain') {
            imgBase.sizing = { type: 'contain', w: p.w, h: p.h };
          }
          slide.addImage(imgBase);
        } catch (e) {
          console.warn('Image add failed:', e);
        }
      }
    }
  }

  pptx.writeFile({ fileName: filename });
}
