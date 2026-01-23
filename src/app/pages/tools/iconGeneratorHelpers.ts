import { CANVAS_SIZE, SHADOW_BLUR_RATIO, SHADOW_OFFSET_RATIO, TEXT_BASELINE_OFFSET, GRADIENT_COLORS } from './iconGeneratorConstants';

export interface IconConfig {
  type: 'icon' | 'text' | 'image';
  text: string;
  iconKey: string;
  bgColor: string;
  fgColor: string;
  gradient: string;
  size: number;
  radius: number;
  rotation: number;
  offsetY: number;
  shadow: boolean;
  uploadedImage?: string;
}

export const defaultConfig: IconConfig = {
  type: 'icon',
  text: 'A',
  iconKey: 'Rocket',
  bgColor: '#3b82f6',
  fgColor: '#ffffff',
  gradient: 'none',
  size: 60,
  radius: 20,
  rotation: 0,
  offsetY: 0,
  shadow: false,
};

export const createCanvas = (size: number = CANVAS_SIZE): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  return [canvas, ctx];
};

export const drawRoundedRect = (ctx: CanvasRenderingContext2D, size: number, radius: number) => {
  const r = (radius / 100) * size;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
};

export const applyGradient = (ctx: CanvasRenderingContext2D, gradient: string, bgColor: string, size: number) => {
  if (gradient === 'none') {
    ctx.fillStyle = bgColor;
    return;
  }
  
  const gradientName = gradient.match(/Sunset|Ocean|Purple|Midnight|Cherry|Nature|Slick/)?.[0];
  if (gradientName && GRADIENT_COLORS[gradientName]) {
    const [start, end] = GRADIENT_COLORS[gradientName];
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, start);
    grad.addColorStop(1, end);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgColor;
  }
};

export const applyShadow = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = size * SHADOW_BLUR_RATIO;
  ctx.shadowOffsetY = size * SHADOW_OFFSET_RATIO;
};

export const drawBackground = (ctx: CanvasRenderingContext2D, config: IconConfig, size: number) => {
  ctx.save();
  drawRoundedRect(ctx, size, config.radius);
  ctx.clip();
  applyGradient(ctx, config.gradient, config.bgColor, size);
  ctx.fill();
  ctx.restore();
};

export const drawIcon = async (
  ctx: CanvasRenderingContext2D,
  svgNode: SVGSVGElement,
  config: IconConfig,
  size: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgNode);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.save();
      ctx.translate(size / 2, size / 2 + (config.offsetY * size / 200));
      ctx.rotate((config.rotation * Math.PI) / 180);
      if (config.shadow) applyShadow(ctx, size);
      const s = (config.size / 100) * size;
      ctx.drawImage(img, -s / 2, -s / 2, s, s);
      ctx.restore();
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const drawText = (ctx: CanvasRenderingContext2D, config: IconConfig, size: number) => {
  ctx.save();
  ctx.translate(size / 2, size / 2 + (config.offsetY * size / 200));
  ctx.rotate((config.rotation * Math.PI) / 180);
  if (config.shadow) applyShadow(ctx, size);
  const contentSize = (config.size / 100) * size;
  ctx.fillStyle = config.fgColor;
  ctx.font = `bold ${contentSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.text, 0, contentSize * TEXT_BASELINE_OFFSET);
  ctx.restore();
};

export const drawUploadedImage = async (
  ctx: CanvasRenderingContext2D,
  imageUrl: string,
  config: IconConfig,
  size: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.translate(size / 2, size / 2 + (config.offsetY * size / 200));
      ctx.rotate((config.rotation * Math.PI) / 180);
      if (config.shadow) applyShadow(ctx, size);
      const s = (config.size / 100) * size;
      ctx.drawImage(img, -s / 2, -s / 2, s, s);
      ctx.restore();
      resolve();
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const downloadSVG = (config: IconConfig, svgNode: SVGSVGElement | null, filename: string) => {
  if (!svgNode) return;
  
  const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgWrapper.setAttribute('width', CANVAS_SIZE.toString());
  svgWrapper.setAttribute('height', CANVAS_SIZE.toString());
  svgWrapper.setAttribute('viewBox', `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`);
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', 'rounded-rect');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', CANVAS_SIZE.toString());
  rect.setAttribute('height', CANVAS_SIZE.toString());
  rect.setAttribute('rx', ((config.radius / 100) * CANVAS_SIZE).toString());
  clipPath.appendChild(rect);
  defs.appendChild(clipPath);
  svgWrapper.appendChild(defs);
  
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', CANVAS_SIZE.toString());
  bgRect.setAttribute('height', CANVAS_SIZE.toString());
  bgRect.setAttribute('clip-path', 'url(#rounded-rect)');
  
  if (config.gradient !== 'none') {
    const gradientName = config.gradient.match(/Sunset|Ocean|Purple|Midnight|Cherry|Nature|Slick/)?.[0];
    if (gradientName && GRADIENT_COLORS[gradientName]) {
      const [start, end] = GRADIENT_COLORS[gradientName];
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'bg-gradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', start);
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', end);
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
      bgRect.setAttribute('fill', 'url(#bg-gradient)');
    }
  } else {
    bgRect.setAttribute('fill', config.bgColor);
  }
  svgWrapper.appendChild(bgRect);
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${CANVAS_SIZE / 2}, ${CANVAS_SIZE / 2 + (config.offsetY * CANVAS_SIZE / 200)}) rotate(${config.rotation})`);
  g.setAttribute('clip-path', 'url(#rounded-rect)');
  
  const clonedIcon = svgNode.cloneNode(true) as SVGSVGElement;
  const iconSize = (config.size / 100) * CANVAS_SIZE;
  clonedIcon.setAttribute('width', iconSize.toString());
  clonedIcon.setAttribute('height', iconSize.toString());
  clonedIcon.setAttribute('x', (-iconSize / 2).toString());
  clonedIcon.setAttribute('y', (-iconSize / 2).toString());
  clonedIcon.setAttribute('color', config.fgColor);
  
  g.appendChild(clonedIcon);
  svgWrapper.appendChild(g);
  
  const svgData = new XMLSerializer().serializeToString(svgWrapper);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportMultipleSizes = async (
  config: IconConfig,
  previewElement: HTMLElement | null,
  sizes: number[]
) => {
  if (!previewElement) return;
  
  for (const size of sizes) {
    const [canvas, ctx] = createCanvas(size);
    drawBackground(ctx, config, size);
    
    if (config.type === 'icon') {
      const svgNode = previewElement.querySelector('svg');
      if (svgNode) {
        await drawIcon(ctx, svgNode, config, size);
        downloadCanvas(canvas, `icon-${size}x${size}.png`);
      }
    } else if (config.type === 'text') {
      drawText(ctx, config, size);
      downloadCanvas(canvas, `icon-${size}x${size}.png`);
    } else if (config.type === 'image' && config.uploadedImage) {
      await drawUploadedImage(ctx, config.uploadedImage, config, size);
      downloadCanvas(canvas, `icon-${size}x${size}.png`);
    }
  }
};
