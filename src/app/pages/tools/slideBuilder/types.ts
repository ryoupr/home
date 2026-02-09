declare global {
  interface Window { PptxGenJS?: new () => any; }
}

export const PPTX_CDN = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
export const PPTX_SRI = 'sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ';
export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
export const PX_TO_PT = 0.75;
export const MIN_CONTAINER_W = 800;
export const MIN_CONTAINER_H = 400;
export const MAX_ELEMENTS = 2000;

export interface RichTextSegment {
  text: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean;
  fontSize?: number; color?: string; fontFamily?: string; hyperlink?: string;
  breakAfter?: boolean;
}

export interface SlideElement {
  type: 'shape' | 'text' | 'image' | 'list' | 'table';
  x: number; y: number; w: number; h: number;
  zIndex: number;
  domOrder: number;
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
  imgSizing?: 'cover' | 'contain' | 'crop';
}

export interface Pos { x: number; y: number; w: number; h: number }
