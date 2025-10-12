import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Athletic design token colors - needed for Tailwind utility generation
        'athletic-brand-violet': '#7c3aed',
        'athletic-court-orange': '#ea580c',
        'athletic-court-navy': '#1a365d',
        'athletic-success': '#10b981',
        'athletic-warning': '#f59e0b',
        'athletic-error': '#ef4444',
        // Athletic neutral scale
        'athletic-neutral-50': '#fafafa',
        'athletic-neutral-100': '#f5f5f5',
        'athletic-neutral-200': '#e5e5e5',
        'athletic-neutral-300': '#d4d4d4',
        'athletic-neutral-400': '#a3a3a3',
        'athletic-neutral-500': '#737373',
        'athletic-neutral-600': '#525252',
        'athletic-neutral-700': '#404040',
        'athletic-neutral-800': '#262626',
        'athletic-neutral-900': '#171717',
        'athletic-neutral-950': '#0a0a0a',
      },
      transitionDuration: {
        'quick-snap': '90ms',
        'reaction': '120ms',
        'transition': '160ms',
        'sequence': '220ms',
        'flash': '60ms',
        'flow': '300ms',
        'power': '400ms',
      },
      transitionTimingFunction: {
        'athletic-snap': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'athletic-flow': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'athletic-power': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'athletic-precision': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'athletic-sprint': 'cubic-bezier(0.55, 0, 0.1, 1)',
        'athletic-glide': 'cubic-bezier(0.25, 0, 0.75, 1)',
      },
    },
  },
  plugins: [typography],
}
