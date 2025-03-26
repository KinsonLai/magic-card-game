export default function Loading() {
    return (
      <div className="fixed inset-0 bg-deep-space/90 backdrop-blur-xl z-50 
        flex items-center justify-center">
        <div className="relative w-32 h-32">
          {/* 外層魔法陣 */}
          <div className="absolute inset-0 border-4 border-purple-500/30 
            rounded-full animate-spin"></div>
          
          {/* 內層符文 */}
          <div className="absolute inset-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-16 h-16 animate-pulse">
              <path
                fill="currentColor"
                d="M12 2L2 12l10 10 10-10L12 2zm0 18l-8-8 8-8 8 8-8 8z"
              />
              <path
                fill="currentColor"
                d="M12 6l-6 6 6 6 6-6-6-6zm0 10l-4-4 4-4 4 4-4 4z"
              />
            </svg>
          </div>
          
          {/* 浮動光點 */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full 
              animate-float delay-100"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full 
              animate-float delay-300"></div>
          </div>
        </div>
      </div>
    )
  }