"use client"

import { useEffect, useRef } from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

export default function MakeupModel3D() {
  const modelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Load model-viewer script
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js'
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div className="w-full h-full">
      <model-viewer
        ref={modelRef}
        src="/makeup__cosmetics.glb"
        alt="Makeup Products 3D Model"
        auto-rotate
        camera-controls
        disable-zoom
        disable-pan
        shadow-intensity="1.5"
        
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
        exposure="1.5"
        shadow-softness="0.5"
        lighting-environment="studio"
        min-camera-orbit="auto auto auto"
        max-camera-orbit="auto auto auto"
      />
    </div>
  )
}
