import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [],
}

export default config
