import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
          100: '#DBEAFE'
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#6366F1',
        temp: {
          cold: '#3B82F6',
          warm: '#F59E0B',
          hot: '#EF4444'
        },
        gray: {
          900: '#111827',
          700: '#374151',
          400: '#9CA3AF',
          100: '#F3F4F6'
        },
        white: '#FFFFFF',
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155'
        }
      },
      borderRadius: {
        xl: '12px'
      }
    }
  },
  plugins: [],
}
export default config
