import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./resources/js/**/*.{js,ts,jsx,tsx}",
    "./resources/views/**/*.blade.php"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
