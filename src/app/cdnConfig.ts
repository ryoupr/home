/**
 * CDN configuration for external libraries loaded at runtime.
 * Centralized to avoid hardcoded URLs scattered across components.
 */
export const CDN_LIBS = {
  pptxgenjs: {
    url: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
    sri: 'sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ',
  },
} as const;
