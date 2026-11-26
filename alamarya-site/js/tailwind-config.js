if (typeof tailwind !== "undefined") tailwind.config = {
  theme: {
    extend: {
      fontFamily: { tajawal: ['Tajawal', 'Cairo', 'sans-serif'], cairo: ['Cairo', 'Tajawal', 'sans-serif'] },
      colors: {
        bgdark: { 950: '#050a08', 900: '#08110d', 800: '#0e1b15', 700: '#142a20', 600: '#1b3a2c' },
        bgreen: { 300: '#fde68a', 400: '#eab308', 500: '#dfb136', 600: '#c8951e', 700: '#a17412', 800: '#143324', 900: '#0b2218' }
      },
      boxShadow: {
        'emerald-glow': '0 0 25px rgba(223, 177, 54, 0.28)',
        'emerald-strong': '0 0 40px rgba(223, 177, 54, 0.45)'
      }
    }
  }
};
