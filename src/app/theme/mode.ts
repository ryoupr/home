import { useCallback, useEffect, useSyncExternalStore } from 'react';

/**
 * 昼（day）/ 夜（night）モード。
 *
 * <html data-mode="..."> に反映し、CSS 側は theme.css の `[data-mode="night"] .theme-trail` で切り替える。
 * next-themes は初期化用のインラインスクリプトを挿入するが、index.html の CSP（script-src は
 * 固定ハッシュのみ許可）でブロックされるため使わない。
 */
export type Mode = 'day' | 'night';

const STORAGE_KEY = 'tg-mode';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStored(): Mode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'day' || v === 'night' ? v : null;
  } catch {
    return null;
  }
}

function systemMode(): Mode {
  return window.matchMedia?.(DARK_QUERY).matches ? 'night' : 'day';
}

function applyMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
}

/** 描画前に一度だけ呼ぶ（main.tsx）。保存済みの選択 → OS 設定の順で決める */
export function initMode() {
  applyMode(readStored() ?? systemMode());
}

function getSnapshot(): Mode {
  return document.documentElement.dataset.mode === 'night' ? 'night' : 'day';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode'],
  });
  return () => observer.disconnect();
}

/** 現在のモードと切り替え関数を返す。手動で選ばない限り OS 設定の変化に追従する */
export function useMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => 'day');

  useEffect(() => {
    const mql = window.matchMedia?.(DARK_QUERY);
    if (!mql) return;
    const onSystemChange = () => {
      if (readStored() === null) applyMode(systemMode());
    };
    mql.addEventListener('change', onSystemChange);
    return () => mql.removeEventListener('change', onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Mode = getSnapshot() === 'night' ? 'day' : 'night';
    applyMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できない環境（プライベートブラウズ等）では、このページ表示中だけ切り替える
    }
  }, []);

  return { mode, toggle } as const;
}
