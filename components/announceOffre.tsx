import { useFeteTheme } from "@/components/coffret/fete-theme-provider"

export function AnnounceOffre() {
  const { theme } = useFeteTheme()

  if (!theme || theme.key === "none") return null

  const announcementText = theme.announcementText || ""
  const icon = theme.icons && theme.icons.length > 0 ? theme.icons[0] : "🎁"

  const gradientFrom = theme.colors.primary || "#FF0055"
  const gradientTo = theme.colors.secondary || theme.colors.primary || "#FF66AA"

  return (
    <div className="w-full">
      <input type="checkbox" id="announcement-toggle" className="peer hidden" />

      <div className={`peer-checked:hidden -mt-4 peer-checked:mt-0 bg-gradient-to-r w-full text-white sticky top-0 z-50 shadow-lg overflow-hidden`} style={{ backgroundImage: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}>
        <div className="relative py-3">
          <div className="flex animate-slide">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 whitespace-nowrap px-8">
                <span className="inline-block text-white animate-pulse flex-shrink-0" style={{ fontSize: 18 }}>{icon}</span>
                <p className="font-medium text-sm sm:text-base">{announcementText}</p>
              </div>
            ))}
          </div>

          <label htmlFor="announcement-toggle" className="cursor-pointer absolute top-1/2 -translate-y-1/2 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-white transition-all duration-200 hover:scale-110" aria-label="Close announcement">
            <span className="text-sm font-bold">✕</span>
          </label>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide { animation: slide 20s linear infinite; }
        .animate-slide:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}