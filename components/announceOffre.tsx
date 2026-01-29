import { Heart } from "lucide-react"

const announcementText = 'Profitez avec You & Me Beauty des offres exclusives pour le Saint Valentin !';

export function AnnounceOffre() {
  return (
    <div className="w-full">
      <input
        type="checkbox"
        id="announcement-toggle"
        className="peer hidden"
      />

      <div className="peer-checked:hidden -mt-4 peer-checked:mt-0  bg-gradient-to-r from-red-500 via-pink-500 to-red-500 w-full text-white sticky top-0 z-50 shadow-lg overflow-hidden">
        <div className="relative py-3">
          {/* Sliding text container */}
          <div className="flex animate-slide">
            {/* First instance */}
            <div className="flex items-center gap-3 whitespace-nowrap px-8">
              <Heart className="inline-block text-white animate-pulse flex-shrink-0" size={20} fill="white" />
              <p className="font-medium text-sm sm:text-base">
                {announcementText}
              </p>
            </div>

            {/* Second instance for seamless loop */}
            <div className="flex items-center gap-3 whitespace-nowrap px-8">
              <Heart className="inline-block text-white animate-pulse flex-shrink-0" size={20} fill="white" />
              <p className="font-medium text-sm sm:text-base">
                {announcementText}
              </p>
            </div>

            {/* Third instance for seamless loop */}
            <div className="flex items-center gap-3 whitespace-nowrap px-8">
              <Heart className="inline-block text-white animate-pulse flex-shrink-0" size={20} fill="white" />
              <p className="font-medium text-sm sm:text-base">
                {announcementText}
              </p>
            </div>

            {/* Fourth instance for seamless loop */}
            <div className="flex items-center gap-3 whitespace-nowrap px-8">
              <Heart className="inline-block text-white animate-pulse flex-shrink-0" size={20} fill="white" />
              <p className="font-medium text-sm sm:text-base">
                {announcementText}
              </p>
            </div>
          </div>

          {/* Close button */}
          <label
            htmlFor="announcement-toggle"
            className="cursor-pointer absolute top-1/2 -translate-y-1/2 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Close announcement"
          >
            <span className="text-sm font-bold">✕</span>
          </label>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slide {
          animation: slide 20s linear infinite;
        }

        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}