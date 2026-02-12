export const CANVAS_SIZE = 1024;
export const SHADOW_BLUR_RATIO = 0.05;
export const SHADOW_OFFSET_RATIO = 0.02;
export const TEXT_BASELINE_OFFSET = 0.05;

export const GRADIENTS = [
  { name: 'Solid', value: 'none' },
  {
    name: 'Sunset',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  { name: 'Ocean', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  {
    name: 'Purple',
    value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  {
    name: 'Midnight',
    value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
  {
    name: 'Cherry',
    value: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
  },
  {
    name: 'Nature',
    value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  },
  { name: 'Slick', value: 'linear-gradient(135deg, #434343 0%, black 100%)' },
];

export const GRADIENT_COLORS: Record<string, [string, string]> = {
  Sunset: ['#f6d365', '#fda085'],
  Ocean: ['#84fab0', '#8fd3f4'],
  Purple: ['#a18cd1', '#fbc2eb'],
  Midnight: ['#30cfd0', '#330867'],
  Cherry: ['#eb3349', '#f45c43'],
  Nature: ['#d4fc79', '#96e6a1'],
  Slick: ['#434343', '#000000'],
};
