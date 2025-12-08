import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import type { MappedDetection, GroupedDetection } from "@/lib/skin-analyzer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
    imageSrc: string;
    detections: MappedDetection[];
    groupedDetections: GroupedDetection[];
    onReset: () => void;
}

export function AnalysisResults({ imageSrc, detections, groupedDetections, onReset }: AnalysisResultsProps) {
    const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
    const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [layoutBoxes, setLayoutBoxes] = useState<
        Array<{ left: number; top: number; width: number; height: number; label: string; color: string; solidColor: string }>
    >([]);

    const INPUT_SIZE = 640;

    const handleResultImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };

    // Observe container resize
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({
                    w: entry.contentRect.width,
                    h: entry.contentRect.height
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!imageSrc || detections.length === 0 || !imageNaturalSize || !containerSize) {
            setLayoutBoxes([]);
            return;
        }

        const natW = imageNaturalSize.w;
        const natH = imageNaturalSize.h;
        const contW = containerSize.w;
        const contH = containerSize.h;

        // Calculate displayed image dimensions (object-contain logic)
        const imageRatio = natW / natH;
        const containerRatio = contW / contH;

        let displayedW, displayedH;

        if (containerRatio > imageRatio) {
            // Container is wider than image -> constrained by height
            displayedH = contH;
            displayedW = contH * imageRatio;
        } else {
            // Container is taller than image -> constrained by width
            displayedW = contW;
            displayedH = contW / imageRatio;
        }

        const offsetX = (contW - displayedW) / 2;
        const offsetY = (contH - displayedH) / 2;
        const scale = displayedW / natW;

        const boxes = detections.map((det) => {
            const [x1, y1, x2, y2] = det.bbox;

            const isNormalized = x2 <= 1 && y2 <= 1;

            // Map to original image coordinates
            let origX1, origY1, origX2, origY2;

            if (isNormalized) {
                origX1 = x1 * natW;
                origY1 = y1 * natH;
                origX2 = x2 * natW;
                origY2 = y2 * natH;
            } else {
                // Scale from INPUT_SIZE to Natural Size
                const scaleX = natW / INPUT_SIZE;
                const scaleY = natH / INPUT_SIZE;
                origX1 = x1 * scaleX;
                origY1 = y1 * scaleY;
                origX2 = x2 * scaleX;
                origY2 = y2 * scaleY;
            }

            // Map to displayed coordinates
            const drawX1 = offsetX + origX1 * scale;
            const drawY1 = offsetY + origY1 * scale;
            const drawX2 = offsetX + origX2 * scale;
            const drawY2 = offsetY + origY2 * scale;

            const width = drawX2 - drawX1;
            const height = drawY2 - drawY1;
            const confidence = Math.round(det.confidence * 100);
            const label = `${det.name}`;

            const color = 'rgba(255, 255, 255, 0.1)';
            const solidColor = 'rgba(255, 255, 255, 0.8)';

            return { left: drawX1, top: drawY1, width, height, label, color, solidColor };
        });

        setLayoutBoxes(boxes);
    }, [detections, imageNaturalSize, imageSrc, containerSize]);


    return (
        <div className="max-w-7xl mx-auto">
            {/* Image and Summary Section */}
            <div className="grid lg:grid-cols-12 gap-12 mb-24">
                {/* Image */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24">
                        <div className="bg-black/5 rounded-sm p-4 mb-6">
                            <div
                                ref={containerRef}
                                className="relative w-full aspect-[3/4] rounded-sm overflow-hidden"
                            >
                                <img
                                    src={imageSrc}
                                    alt="Analyzed face"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onLoad={handleResultImageLoad}
                                />
                                {layoutBoxes.map((box, i) => (
                                    <div
                                        key={i}
                                        className="absolute border transition-all duration-300"
                                        style={{
                                            left: box.left,
                                            top: box.top,
                                            width: box.width,
                                            height: box.height,
                                            borderColor: box.solidColor,
                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <span
                                            className="absolute -top-6 left-0 text-[5px] uppercase tracking-wider px-2 py-0.5 font-medium bg-white/40 text-black/60 backdrop-blur-sm"
                                        >
                                            {box.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={onReset}
                            variant="outline"
                            className="w-full h-12 uppercase tracking-widest text-xs"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Nouvelle Analyse
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-7 space-y-12">
                    <div>
                        <h2 className="font-serif text-3xl mb-6">Résultats de l'analyse</h2>

                        {groupedDetections.length === 0 ? (
                            <div className="bg-secondary/20 p-8 rounded-sm text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">Peau Saine</h3>
                                <p className="text-muted-foreground">
                                    Aucun problème majeur détecté. Continuez votre routine actuelle !
                                </p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {groupedDetections.map((group) => (
                                    <div key={group.classId} className="border border-border p-6 rounded-sm hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium text-lg">{group.name}</h3>
                                            <span className="text-xs font-bold bg-secondary px-2 py-1 rounded-full">
                                                {group.count}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                                            {group.description}
                                        </p>
                                        <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/60"
                                                style={{ width: `${group.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    {groupedDetections.length > 0  && (
                        <div>
                            <h2 className="font-serif text-3xl mb-8">Routine Recommandée</h2>
                            <div className="space-y-16">
                                {groupedDetections.map((group) => (
                                    <div key={group.classId}>
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                                            <AlertCircle className="w-5 h-5 text-primary" />
                                            <h3 className="text-xl font-medium">Pour : {group.name}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {group.products.map((product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}