/**
 * MINIM. — Tailwind 설정 (디자인토큰.json 기준 v1.0.0)
 * 03_개발/ 프로젝트 루트로 복사해 사용. 토큰 변경 시 본 파일이 아닌 JSON을 먼저 수정.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        ink: {
          0: '#FFFFFF',
          50: '#FAFAF9',
          100: '#F4F4F2',
          200: '#E7E6E3',
          300: '#D6D4D0',
          400: '#A8A5A0',
          500: '#78756F',
          600: '#57544F',
          700: '#3D3B37',
          800: '#2A2825',
          900: '#1A1917',
        },
        olive: {
          50: '#F2F3EE',
          100: '#E1E4D8',
          300: '#B4B99F',
          500: '#6E7455',
          600: '#5A6045',
          700: '#464B36',
        },
        danger: { DEFAULT: '#B4453C', bg: '#FBF1F0' },
        success: { DEFAULT: '#3F7355', bg: '#F0F5F2' },
        warning: { DEFAULT: '#9A6B24', bg: '#FAF4EA' },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        display: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1-lg': ['1.625rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['1.0625rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2-lg': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '700' }],
        h3: ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h3-lg': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['0.875rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.55' }],
        caption: ['0.75rem', { lineHeight: '1.5' }],
        micro: ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.02em' }],
        price: ['1.125rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'price-lg': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'price-sm': ['0.8125rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        brand: ['1rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '700' }],
        'brand-lg': ['1.25rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      spacing: {
        0.5: '2px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
        6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
        20: '80px', 24: '96px', 30: '120px',
        header: '56px',
        'header-lg': '72px',
        touch: '44px',
      },
      maxWidth: { container: '1280px' },
      borderRadius: { DEFAULT: '0px', none: '0px', sm: '2px', full: '9999px' },
      borderWidth: { DEFAULT: '1px', 2: '2px', 8: '8px' },
      boxShadow: {
        sm: '0 1px 2px rgba(26,25,23,0.06)',
        md: '0 4px 12px rgba(26,25,23,0.08)',
        lg: '0 -8px 24px rgba(26,25,23,0.10)',
        none: 'none',
      },
      aspectRatio: { product: '3 / 4', 'hero-m': '4 / 5', 'hero-d': '16 / 6', banner: '16 / 9' },
      transitionDuration: { fast: '150ms', base: '250ms', slow: '400ms' },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2,0.8,0.2,1)',
        exit: 'cubic-bezier(0.4,0,1,1)',
      },
      zIndex: { dropdown: '100', sticky: '200', drawer: '300', modal: '400', toast: '500' },
      minHeight: { touch: '44px', control: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
};
