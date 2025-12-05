import React, { useRef, useEffect, useState } from "react";
import { Camera, X, AlertCircle } from "lucide-react";
import { FaceGuide } from "./face-guide";

interface CameraViewProps {
    onCapture: (imageSrc: string) => void;
    onCancel: () => void;
    onError: (error: string) => void;
}

export function CameraView({ onCapture, onCancel, onError }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const constraints: MediaStreamConstraints = {
                    video: {
                        facingMode: { ideal: "user" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false,
                };

                stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true");
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera error:", err);
                onError("Unable to access the camera. Check browser permissions or try uploading an image instead.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [onError]);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = photoCanvasRef.current || document.createElement("canvas");

        if (!video) return;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            onError("Camera not ready yet. Please wait 1 second.");
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Mirror effect for consistency
        ctx.scale(-1, 1);
        ctx.drawImage(video, -width, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        onCapture(dataUrl);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                {/* Instructions */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Scan du Visage
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Positionnez votre visage dans le cadre</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary animate-pulse">
                        EN DIRECT
                    </div>
                </div>

                {/* Camera View with Overlay */}
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner aspect-[3/4] md:aspect-video group">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                    />

                    {/* Futuristic Overlay Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Corner Brackets */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />

                        {/* Scanning Line Animation */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary),0.8)] absolute top-0 animate-scan" />
                        </div>

                        {/* Face Guide Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-80 border-2 border-white/20 rounded-[50%] relative">
                                <div className="absolute top-1/2 left-0 w-2 h-1 bg-white/30 -translate-y-1/2" />
                                <div className="absolute top-1/2 right-0 w-2 h-1 bg-white/30 -translate-y-1/2" />
                                <div className="absolute top-0 left-1/2 w-1 h-2 bg-white/30 -translate-x-1/2" />
                                <div className="absolute bottom-0 left-1/2 w-1 h-2 bg-white/30 -translate-x-1/2" />
                            </div>
                        </div>

                        {/* Grid Overlay (Subtle) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 justify-center items-center">
                    <button
                        onClick={onCancel}
                        className="w-12 h-12 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all flex items-center justify-center"
                        title="Annuler"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <button
                        onClick={capturePhoto}
                        className="h-16 px-8 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] flex items-center gap-3 text-lg group"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-white transition-colors">
                            <div className="w-6 h-6 bg-white rounded-full" />
                        </div>
                        SCANNER
                    </button>
                </div>

                {/* Tips */}
                <div className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Bonne Lumière
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Pas de Lunettes
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Neutre
                    </span>
                </div>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={photoCanvasRef} className="hidden" />

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
