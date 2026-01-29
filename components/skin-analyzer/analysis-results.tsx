import React, { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle, AlertCircle, RefreshCw, Info, Sparkles, TrendingUp } from "lucide-react";
import type { MappedDetection, GroupedDetection } from "@/lib/skin-analyzer";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getSkinConcernSeverity, areConcernsCompatible } from "@/lib/services/skin-product-matcher";

interface AnalysisResultsProps {
    imageSrc: string;
    detections: MappedDetection[];
    groupedDetections: GroupedDetection[];
    onReset: () => void;
}

// Severity color mapping
const SEVERITY_COLORS = {
    severe: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100" },
    moderate: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100" },
    mild: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100" },
};

// Actionable insights based on concern combinations
const CONCERN_INSIGHTS: Record<string, string> = {
    "Acné+Peau grasse": "Votre peau produit un excès de sébum qui contribue à l'acné. Privilégiez des produits légers et non comédogènes.",
    "Acné+Points noirs": "Les pores obstrués évoluent souvent en acné active. Un nettoyage en profondeur et une exfoliation chimique sont recommandés.",
    "Peau sèche+Rides": "La déshydratation accentue les rides. Hydratez intensément pour repulper la peau et réduire leur apparence.",
    "Taches brunes+Rides": "Les signes de l'âge sont visibles. Une approche anti-âge complète avec protection solaire est essentielle.",
    "Rougeurs cutanées+Peau sèche": "Votre barrière cutanée est affaiblie. Renforcez-la avec des céramides et évitez les irritants.",
    "Pores dilatés+Peau grasse": "L'excès de sébum dilate les pores. Matifiez et affinez avec des actifs régulateurs.",
};

// Priority recommendations based on severity
function generatePriorityMessage(groupedDetections: GroupedDetection[]): string | null {
    const severeConcerns = groupedDetections.filter(g => {
        const severity = getSkinConcernSeverity(g.name);
        return severity === 'severe';
    });

    if (severeConcerns.length > 0) {
        return `Attention : ${severeConcerns.length} problème${severeConcerns.length > 1 ? 's' : ''} nécessitant une action prioritaire détecté${severeConcerns.length > 1 ? 's' : ''}.`;
    }

    const moderateConcerns = groupedDetections.filter(g => {
        const severity = getSkinConcernSeverity(g.name);
        return severity === 'moderate';
    });

    if (moderateConcerns.length >= 3) {
        return `Votre peau présente plusieurs problématiques. Une routine ciblée et cohérente est recommandée.`;
    }

    return null;
}

// Get contextual insight
function getContextualInsight(groupedDetections: GroupedDetection[]): string | null {
    if (groupedDetections.length < 2) return null;

    // Check for common combinations
    const concernNames = groupedDetections.map(g => g.name);
    
    for (const [combo, insight] of Object.entries(CONCERN_INSIGHTS)) {
        const [concern1, concern2] = combo.split('+');
        if (concernNames.includes(concern1) && concernNames.includes(concern2)) {
            return insight;
        }
    }

    // Check for incompatible concerns
    for (let i = 0; i < concernNames.length; i++) {
        for (let j = i + 1; j < concernNames.length; j++) {
            if (!areConcernsCompatible(concernNames[i], concernNames[j])) {
                return `⚠️ Attention : "${concernNames[i]}" et "${concernNames[j]}" nécessitent des approches différentes. Privilégiez des soins équilibrants.`;
            }
        }
    }

    return null;
}

export function AnalysisResults({ imageSrc, detections, groupedDetections, onReset }: AnalysisResultsProps) {
    const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
    const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
    const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [layoutBoxes, setLayoutBoxes] = useState<
        Array<{ left: number; top: number; width: number; height: number; label: string; color: string; solidColor: string }>
    >([]);

    const INPUT_SIZE = 640;

    // Memoized calculations
    const sortedDetections = useMemo(() => {
        return [...groupedDetections].sort((a, b) => {
            const severityA = getSkinConcernSeverity(a.name);
            const severityB = getSkinConcernSeverity(b.name);
            
            const severityOrder = { severe: 0, moderate: 1, mild: 2 };
            const orderA = severityOrder[severityA || 'mild'];
            const orderB = severityOrder[severityB || 'mild'];
            
            if (orderA !== orderB) return orderA - orderB;
            return b.confidence - a.confidence;
        });
    }, [groupedDetections]);

    const priorityMessage = useMemo(() => generatePriorityMessage(groupedDetections), [groupedDetections]);
    const contextualInsight = useMemo(() => getContextualInsight(groupedDetections), [groupedDetections]);

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
            displayedH = contH;
            displayedW = contH * imageRatio;
        } else {
            displayedW = contW;
            displayedH = contW / imageRatio;
        }

        const offsetX = (contW - displayedW) / 2;
        const offsetY = (contH - displayedH) / 2;
        const scale = displayedW / natW;

        const boxes = detections.map((det) => {
            const [x1, y1, x2, y2] = det.bbox;
            const isNormalized = x2 <= 1 && y2 <= 1;

            let origX1, origY1, origX2, origY2;

            if (isNormalized) {
                origX1 = x1 * natW;
                origY1 = y1 * natH;
                origX2 = x2 * natW;
                origY2 = y2 * natH;
            } else {
                const scaleX = natW / INPUT_SIZE;
                const scaleY = natH / INPUT_SIZE;
                origX1 = x1 * scaleX;
                origY1 = y1 * scaleY;
                origX2 = x2 * scaleX;
                origY2 = y2 * scaleY;
            }

            const drawX1 = offsetX + origX1 * scale;
            const drawY1 = offsetY + origY1 * scale;
            const drawX2 = offsetX + origX2 * scale;
            const drawY2 = offsetY + origY2 * scale;

            const width = drawX2 - drawX1;
            const height = drawY2 - drawY1;
            const label = `${det.name}`;

            const color = 'rgba(255, 255, 255, 0.1)';
            const solidColor = 'rgba(255, 255, 255, 0.8)';

            return { left: drawX1, top: drawY1, width, height, label, color, solidColor };
        });

        setLayoutBoxes(boxes);
    }, [detections, imageNaturalSize, imageSrc, containerSize]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Priority Alert */}
            {priorityMessage && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">{priorityMessage}</p>
                </div>
            )}

            {/* Contextual Insight */}
            {contextualInsight && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-sm p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Analyse personnalisée</h4>
                        <p className="text-sm text-blue-700">{contextualInsight}</p>
                    </div>
                </div>
            )}

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
                                        className="absolute border-2 transition-all duration-300 hover:border-primary cursor-pointer"
                                        style={{
                                            left: box.left,
                                            top: box.top,
                                            width: box.width,
                                            height: box.height,
                                            borderColor: box.solidColor,
                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                                        }}
                                        onClick={() => setSelectedConcern(box.label)}
                                    >
                                        <span
                                            className="absolute -top-6 left-0 text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium bg-white/90 text-black/70 backdrop-blur-sm rounded"
                                        >
                                            {box.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="bg-secondary/20 rounded-sm p-4 mb-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Zones analysées</span>
                                <span className="font-semibold">{detections.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-muted-foreground">Problématiques identifiées</span>
                                <span className="font-semibold">{groupedDetections.length}</span>
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
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="font-serif text-3xl">Résultats de l'analyse</h2>
                            {groupedDetections.length > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                    {sortedDetections.length} {sortedDetections.length === 1 ? 'problématique' : 'problématiques'}
                                </span>
                            )}
                        </div>

                        {groupedDetections.length === 0 ? (
                            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-sm text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-medium mb-2 text-emerald-900">Peau Saine</h3>
                                <p className="text-emerald-700">
                                    Aucun problème majeur détecté. Continuez votre routine actuelle !
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedDetections.map((group) => {
                                    const severity = getSkinConcernSeverity(group.name) || 'mild';
                                    const colors = SEVERITY_COLORS[severity];
                                    const isSelected = selectedConcern === group.name;

                                    return (
                                        <div 
                                            key={group.classId} 
                                            className={`border ${colors.border} ${colors.bg} p-6 rounded-sm transition-all duration-300 cursor-pointer ${
                                                isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:shadow-md'
                                            }`}
                                            onClick={() => setSelectedConcern(isSelected ? null : group.name)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-medium text-lg">{group.name}</h3>
                                                    <span className={`text-xs font-semibold ${colors.badge} px-2 py-1 rounded-full ${colors.text}`}>
                                                        {severity === 'severe' ? 'Prioritaire' : severity === 'moderate' ? 'Modéré' : 'Léger'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold bg-white/70 px-2.5 py-1 rounded-full">
                                                    {group.count} {group.count === 1 ? 'zone' : 'zones'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {group.description}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-white/50 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${
                                                            severity === 'severe' ? 'bg-red-500' :
                                                            severity === 'moderate' ? 'bg-amber-500' :
                                                            'bg-blue-500'
                                                        } transition-all duration-500`}
                                                        style={{ width: `${group.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {Math.round(group.confidence * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    {groupedDetections.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-3xl">Routine Recommandée</h2>
                            </div>
                            
                            <div className="space-y-16">
                                {sortedDetections.map((group) => {
                                    const severity = getSkinConcernSeverity(group.name) || 'mild';
                                    const isSelected = selectedConcern === group.name;

                                    return (
                                        <div 
                                            key={group.classId}
                                            className={`transition-all duration-300 ${
                                                selectedConcern && !isSelected ? 'opacity-40' : 'opacity-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    severity === 'severe' ? 'bg-red-500' :
                                                    severity === 'moderate' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                                }`} />
                                                <h3 className="text-xl font-medium">Pour : {group.name}</h3>
                                                <span className="text-xs text-muted-foreground">
                                                    ({group.products.length} {group.products.length === 1 ? 'produit' : 'produits'})
                                                </span>
                                            </div>

                                            {group.products.length === 0 ? (
                                                <div className="bg-secondary/20 border border-dashed border-border p-6 rounded-sm text-center">
                                                    <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Aucun produit spécifique disponible actuellement pour cette problématique.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {group.products.map((product) => (
                                                        <ProductCard key={product.id} product={product} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}