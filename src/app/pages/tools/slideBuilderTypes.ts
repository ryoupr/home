/** Shared types and constants for SlideBuilder modules. */

export interface PptxSlide {
  addShape(type: string, opts: Record<string, unknown>): void;
  addText(
    text: string | Array<Record<string, unknown>>,
    opts: Record<string, unknown>
  ): void;
  addImage(opts: Record<string, unknown>): void;
  addTable(
    rows: Array<Array<Record<string, unknown>>>,
    opts: Record<string, unknown>
  ): void;
  background: Record<string, unknown>;
}

export interface PptxPresentation {
  defineLayout(opts: { name: string; width: number; height: number }): void;
  layout: string;
  addSlide(): PptxSlide;
  writeFile(opts: { fileName: string }): Promise<void>;
}

declare global {
  interface Window {
    PptxGenJS?: new () => PptxPresentation;
  }
}

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
export const PX_TO_PT = 0.75;
export const MIN_CONTAINER_W = 800;
export const MIN_CONTAINER_H = 400;
export const MAX_ELEMENTS = 2000;
export const MAX_CSS_LEN = 500;

export interface RichTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  hyperlink?: string;
  breakAfter?: boolean;
}

export interface SlideElement {
  type: 'shape' | 'text' | 'image' | 'list' | 'table';
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  domOrder: number;
  fill?: string;
  gradient?: { angle: number; color1: string; color2: string };
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borders?: { color: string; width: number }[];
  shadow?: {
    blur: number;
    offsetX: number;
    offsetY: number;
    color: string;
    opacity: number;
  };
  rotate?: number;
  padding?: { t: number; r: number; b: number; l: number };
  text?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  fontStrike?: boolean;
  fontColor?: string;
  fontFamily?: string;
  align?: string;
  valign?: string;
  charSpacing?: number;
  lineHeight?: number;
  hyperlink?: string;
  richText?: RichTextSegment[];
  bullets?: {
    text: string;
    bold: boolean;
    fontSize: number;
    color: string;
    indentLevel?: number;
  }[];
  listType?: 'bullet' | 'number';
  tableRows?: string[][];
  imgSrc?: string;
  imgSizing?: 'cover' | 'contain' | 'crop';
}
