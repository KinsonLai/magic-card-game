// 项目根目录下创建
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // 魔法主题配色
          'magic-purple': '#6d28d9',
          'nature-green': '#10b981',
          'deep-space': '#1a1a2e',
          'fire-orange': '#f59e0b',
          'text-light': '#e2e8f0'
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 3s ease-in-out infinite'
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }
      }
    },
    plugins: [],
  }