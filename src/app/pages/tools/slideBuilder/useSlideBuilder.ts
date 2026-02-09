import { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { PPTX_CDN, PPTX_SRI, type SlideElement } from './types';
import { extractSlides } from './extractor';
import { generatePptx } from './pptx';

const SANITIZE_OPTS = { WHOLE_DOCUMENT: true, ADD_TAGS: ['style', 'link'], ADD_ATTR: ['class', 'style'] } as const;

export function useSlideBuilder(html: string) {
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ slides: 0, elements: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => { document.title = 'Slide Builder | ryoupr'; }, []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const obs = new ResizeObserver(entries => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { width } = entries[0].contentRect;
        setPreviewScale(Math.min((width - 32) / 1280, 0.9));
      }, 100);
    });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [showPreview]);

  const [cdnReady, setCdnReady] = useState(!!window.PptxGenJS);
  useEffect(() => {
    if (document.getElementById('pptxgenjs-cdn')) { setCdnReady(!!window.PptxGenJS); return; }
    const s = document.createElement('script');
    s.id = 'pptxgenjs-cdn';
    s.src = PPTX_CDN;
    s.integrity = PPTX_SRI;
    s.crossOrigin = 'anonymous';
    s.onload = () => setCdnReady(true);
    document.head.appendChild(s);
  }, []);

  const extractIframeRef = useRef<HTMLIFrameElement | null>(null);
  const extractWithTempIframe = useCallback((htmlContent: string): Promise<SlideElement[][]> => {
    return new Promise((resolve) => {
      let tmp = extractIframeRef.current;
      if (!tmp || !tmp.isConnected) {
        tmp = document.createElement('iframe');
        tmp.sandbox.add('allow-same-origin');
        tmp.style.cssText = 'position:fixed;left:-9999px;width:1280px;height:720px;visibility:hidden';
        document.body.appendChild(tmp);
        extractIframeRef.current = tmp;
      }
      tmp.onload = () => {
        try {
          const doc = tmp!.contentDocument;
          resolve(doc ? extractSlides(doc) : [[]]);
        } catch (e) { console.warn('Extraction failed:', e); resolve([[]]); }
      };
      tmp.srcdoc = DOMPurify.sanitize(htmlContent, SANITIZE_OPTS);
    });
  }, []);

  useEffect(() => () => { extractIframeRef.current?.remove(); }, []);

  const updateStats = useCallback(async () => {
    try {
      const slides = await extractWithTempIframe(html);
      setStats({ slides: slides.length, elements: slides.reduce((s, sl) => s + sl.length, 0) });
    } catch (e) { console.warn('Stats update failed:', e); setStats({ slides: 0, elements: 0 }); }
  }, [html, extractWithTempIframe]);

  const onIframeLoad = useCallback(() => { updateStats(); }, [updateStats]);

  useEffect(() => {
    const t = setTimeout(updateStats, 500);
    return () => clearTimeout(t);
  }, [html, updateStats]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleExport = useCallback(async () => {
    if (!cdnReady || !window.PptxGenJS) { showToast('PptxGenJS を読み込み中...'); return; }
    setExporting(true);
    try {
      const slides = await extractWithTempIframe(html);
      generatePptx(slides, 'slide-output.pptx');
    } catch (e) {
      showToast('エクスポートエラー: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, [html, showToast, extractWithTempIframe, cdnReady]);

  const sanitizedHtml = DOMPurify.sanitize(html, SANITIZE_OPTS);

  return {
    exporting, stats, toast, setToast, iframeRef, previewContainerRef,
    previewScale, showPreview, setShowPreview, cdnReady,
    onIframeLoad, handleExport, sanitizedHtml,
  };
}
