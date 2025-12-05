import React from "react";

export function FaceGuide() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay with cutout effect */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <mask id="faceMask">
                        <rect width="100" height="100" fill="white" />
                        {/* Oval cutout for face */}
                        <ellipse cx="50" cy="45" rx="28" ry="38" fill="black" />
                    </mask>
                </defs>
                {/* Semi-transparent overlay */}
                <rect width="100" height="100" fill="black" opacity="0.5" mask="url(#faceMask)" />
                {/* Glowing oval guide */}
                <ellipse
                    cx="50"
                    cy="45"
                    rx="28"
                    ry="38"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.4"
                    opacity="0.9"
                    className="animate-pulse"
                />
                <ellipse
                    cx="50"
                    cy="45"
                    rx="28"
                    ry="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.6"
                    opacity="0.7"
                />
            </svg>

            {/* Positioning Guides */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                Align your face with the guide
            </div>

            {/* Corner Guides */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-12">
                <div className="w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
            </div>
            <div className="absolute top-1/4 right-1/2 transform translate-x-1/2 -translate-y-12">
                <div className="w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
            </div>
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-12">
                <div className="w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-lg" />
            </div>
            <div className="absolute bottom-1/4 right-1/2 transform translate-x-1/2 translate-y-12">
                <div className="w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-lg" />
            </div>

            {/* Center alignment marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 left-0" />
            </div>
        </div>
    );
}
