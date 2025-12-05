import React, { useRef } from "react";
import { Camera, Upload, Info } from "lucide-react";

interface UploadViewProps {
    onStartCamera: () => void;
    onFileUpload: (file: File) => void;
    onError: (error: string) => void;
}

export function UploadView({ onStartCamera, onFileUpload, onError }: UploadViewProps) {
    const fileRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            onError("Image too large. Please upload an image smaller than 10MB.");
            return;
        }
        onFileUpload(file);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <button
                    onClick={onStartCamera}
                    className="group flex flex-col items-center justify-center gap-4 p-12 border border-border hover:border-primary/50 bg-card hover:bg-secondary/20 transition-all duration-500 rounded-sm"
                >
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Camera className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-center space-y-1">
                        <span className="block font-serif text-xl font-medium">Prendre une Photo</span>
                        <span className="block text-xs uppercase tracking-widest text-muted-foreground">Utiliser la caméra</span>
                    </div>
                </button>

                <label
                    htmlFor="file"
                    className="group flex flex-col items-center justify-center gap-4 p-12 border border-border hover:border-primary/50 bg-card hover:bg-secondary/20 transition-all duration-500 rounded-sm cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-center space-y-1">
                        <span className="block font-serif text-xl font-medium">Télécharger</span>
                        <span className="block text-xs uppercase tracking-widest text-muted-foreground">Depuis la galerie</span>
                    </div>
                    <input
                        id="file"
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>

            <div className="flex gap-4 p-6 bg-secondary/10 rounded-sm border border-border/50">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Pour de meilleurs résultats, assurez-vous d'être dans un endroit bien éclairé et sans maquillage.
                    Gardez votre visage centré et détendu.
                </p>
            </div>
        </div>
    );
}
