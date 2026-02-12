import type React from 'react';
import { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

const ALLOWED_PROTOCOLS = ['https:', 'data:', 'blob:'];

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Reject protocol-relative URLs (//evil.com/...)
  if (url.startsWith('//')) return false;
  // Allow same-origin relative paths
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../'))
    return true;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  const safeSrc = isSafeUrl(src) ? src : undefined;

  if (didError || !safeSrc) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            {...rest}
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
