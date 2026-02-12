/**
 * SlideBuilder barrel export.
 * Re-exports from split modules: types, colors, DOM extraction, PPTX generation.
 */

export { extractSlides } from './slideBuilderDom';
export { generatePptx } from './slideBuilderPptxGen';
export type { RichTextSegment, SlideElement } from './slideBuilderTypes';
