"use client";

import { useState, useEffect } from "react";
// NOTE: onnxruntime-web loaded dynamically from CDN to avoid webpack build issues
import {
    Sparkles,
    AlertCircle,
    Loader2,
    X,
} from "lucide-react";
import { CameraView } from "@/components/skin-analyzer/camera-view";
import { UploadView } from "@/components/skin-analyzer/upload-view";
import { AnalysisResults } from "@/components/skin-analyzer/analysis-results";
import { getProductsForSkinConcern } from "@/lib/services/skin-product-matcher";
import type { DetectionRaw, MappedDetection, GroupedDetection, Product } from "@/lib/skin-analyzer";

// ----------------- Config -----------------
const INPUT_SIZE = 640;
const CONF_THRESHOLD = 0.15;
const IOU_THRESHOLD = 0.45;

const CLASS_NAMES = [
    "Acné",
    "Points noirs",
    "Taches brunes",
    "Peau sèche",
    "Pores dilatés",
    "Poches sous les yeux",
    "Peau grasse",
    "Rougeurs cutanées",
    "Points blancs",
    "Rides",
];

// Static info about skin concerns (without products)
const SKIN_CONCERN_DETAILS: Record<number, { name: string; description: string }> = {
    0: { name: "Acné", description: "Éruptions actives détectées" },
    1: { name: "Points noirs", description: "Pores obstrués détectés" },
    2: { name: "Taches brunes", description: "Hyperpigmentation détectée" },
    3: { name: "Peau sèche", description: "Peau déshydratée détectée" },
    4: { name: "Pores dilatés", description: "Pores élargis visibles détectés" },
    5: { name: "Poches sous les yeux", description: "Gonflement sous les yeux détecté" },
    6: { name: "Peau grasse", description: "Production excessive de sébum détectée" },
    7: { name: "Rougeurs cutanées", description: "Rougeurs et irritation détectées" },
    8: { name: "Points blancs", description: "Comédons fermés détectés" },
    9: { name: "Rides", description: "Ridules et rides détectées" },
};

// ----------------- Helpers: ONNX model, preprocess, NMS -----------------

let onnxSession: any = null;

async function loadONNXRuntime(): Promise<any> {
    // Load ONNX Runtime from CDN to avoid webpack bundling
    return new Promise((resolve, reject) => {
        if ((window as any).ort) {
            resolve((window as any).ort);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.min.js';
        script.async = true;

        script.onload = () => {
            const ort = (window as any).ort;
            if (!ort) {
                reject(new Error('ONNX Runtime not found after script load'));
                return;
            }

            // Configure ONNX Runtime
            ort.env.wasm.numThreads = 1;
            ort.env.wasm.simd = true;
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/';

            resolve(ort);
        };

        script.onerror = () => reject(new Error('Failed to load ONNX Runtime from CDN'));
        document.head.appendChild(script);
    });
}
async function loadModel() {
    if (onnxSession) return onnxSession;

    try {
        // Load ONNX Runtime from CDN and get the module
        const ort = await loadONNXRuntime();

        const modelPath = "/models/best.onnx";

        // Fetch the model file as ArrayBuffer for better error handling
        const modelResponse = await fetch(modelPath);

        if (!modelResponse.ok) {
            throw new Error(`Failed to fetch model: ${modelResponse.status} ${modelResponse.statusText}`);
        }

        const modelArrayBuffer = await modelResponse.arrayBuffer();

        // Load ONNX model with simplified configuration
        try {
            onnxSession = await ort.InferenceSession.create(modelArrayBuffer, {
                executionProviders: ['wasm'],
            });

            return onnxSession;
        } catch (sessionError: any) {
            // Log detailed error information
            console.error("InferenceSession.create failed:", {
                error: sessionError,
                message: sessionError?.message,
                code: sessionError?.code,
                name: sessionError?.name,
                stack: sessionError?.stack
            });
            throw sessionError;
        }
    } catch (error: any) {
        console.error("Error loading ONNX model:", error);

        // Provide more helpful error messages
        let errorMessage = "Échec du chargement du modèle";

        if (error instanceof Error) {
            const errMsg = error.message.toLowerCase();

            if (errMsg.includes('fetch') || errMsg.includes('network')) {
                errorMessage = "Impossible de charger le modèle. Vérifiez votre connexion internet.";
            } else if (errMsg.includes('wasm')) {
                errorMessage = "Erreur lors du chargement des fichiers WebAssembly. Veuillez réessayer.";
            } else if (errMsg.includes('not accessible') || errMsg.includes('404')) {
                errorMessage = "Le fichier du modèle est introuvable. Assurez-vous que best.onnx existe dans public/models/";
            } else if (errMsg.includes('memory') || errMsg.includes('oom')) {
                errorMessage = "Mémoire insuffisante pour charger le modèle. Fermez d'autres onglets et réessayez.";
            } else if ((error as any).code || typeof error === 'number') {
                errorMessage = `Erreur ONNX Runtime (code: ${(error as any).code || error}). Le modèle pourrait être incompatible avec cette version d'ONNX Runtime.`;
            } else {
                errorMessage = `Erreur de chargement du modèle: ${error.message}`;
            }
        } else if (typeof error === 'number') {
            errorMessage = `Erreur ONNX Runtime (code: ${error}). Le modèle pourrait être corrompu ou incompatible.`;
        }

        throw new Error(errorMessage);
    }
}
function preprocessImageToTensor(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // Draw and resize image
    ctx.drawImage(img, 0, 0, INPUT_SIZE, INPUT_SIZE);

    // Get image data
    const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const { data } = imageData;

    // Convert to float32 array [1, 3, INPUT_SIZE, INPUT_SIZE] (CHW format)
    const float32Data = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE);

    for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
        float32Data[i] = data[i * 4] / 255.0; // R
        float32Data[INPUT_SIZE * INPUT_SIZE + i] = data[i * 4 + 1] / 255.0; // G
        float32Data[INPUT_SIZE * INPUT_SIZE * 2 + i] = data[i * 4 + 2] / 255.0; // B
    }

    return float32Data;
}

function iou(boxA: [number, number, number, number], boxB: [number, number, number, number]) {
    const xA = Math.max(boxA[0], boxB[0]);
    const yA = Math.max(boxA[1], boxB[1]);
    const xB = Math.min(boxA[2], boxB[2]);
    const yB = Math.min(boxA[3], boxB[3]);

    const interW = Math.max(0, xB - xA);
    const interH = Math.max(0, yB - yA);
    const interArea = interW * interH;

    const areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
    const areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);

    return interArea / (areaA + areaB - interArea);
}

function nonMaxSuppression(dets: DetectionRaw[], iouThresh = IOU_THRESHOLD) {
    dets.sort((a, b) => b.score - a.score);
    const keep: DetectionRaw[] = [];
    const suppressed = new Array(dets.length).fill(false);

    for (let i = 0; i < dets.length; i++) {
        if (suppressed[i]) continue;
        const a = dets[i];
        keep.push(a);
        for (let j = i + 1; j < dets.length; j++) {
            if (suppressed[j]) continue;
            const b = dets[j];
            const overlap = iou(a.bbox, b.bbox);
            if (overlap > iouThresh) suppressed[j] = true;
        }
    }
    return keep;
}

// Convert raw model output to DetectionRaw[]
function parseYoloOutput(data: Float32Array, shape: number[], confThreshold = CONF_THRESHOLD) {
    const numClasses = CLASS_NAMES.length;
    const channels = 4 + numClasses;

    let isChannelFirst = false;
    let numAnchors = 0;

    if (shape.length === 3) {
        if (shape[1] === channels) {
            isChannelFirst = true;
            numAnchors = shape[2];
        } else if (shape[2] === channels) {
            isChannelFirst = false;
            numAnchors = shape[1];
        } else {
            console.warn(`Unknown shape format: ${shape}. Assuming [1, anchors, channels] with ${channels} channels.`);
            numAnchors = shape[1];
        }
    } else {
        console.warn(`Unexpected shape rank: ${shape.length}. Trying to infer from data length.`);
        numAnchors = data.length / channels;
        isChannelFirst = false;
    }

    const dets: DetectionRaw[] = [];

    for (let i = 0; i < numAnchors; i++) {
        let xCenter, yCenter, w, h;
        let scoresOffset;

        if (isChannelFirst) {
            xCenter = data[0 * numAnchors + i];
            yCenter = data[1 * numAnchors + i];
            w = data[2 * numAnchors + i];
            h = data[3 * numAnchors + i];
            scoresOffset = 4 * numAnchors + i;
        } else {
            const offset = i * channels;
            xCenter = data[offset + 0];
            yCenter = data[offset + 1];
            w = data[offset + 2];
            h = data[offset + 3];
            scoresOffset = offset + 4;
        }

        let bestClass = 0;
        let bestScore = -Infinity;

        for (let c = 0; c < numClasses; c++) {
            let score;
            if (isChannelFirst) {
                score = data[scoresOffset + c * numAnchors];
            } else {
                score = data[scoresOffset + c];
            }

            if (score > bestScore) {
                bestScore = score;
                bestClass = c;
            }
        }

        if (bestScore >= confThreshold) {
            const x1 = xCenter - w / 2;
            const y1 = yCenter - h / 2;
            const x2 = xCenter + w / 2;
            const y2 = yCenter + h / 2;

            const clamp = (v: number) => Math.max(0, Math.min(INPUT_SIZE, v));

            dets.push({
                classId: bestClass,
                score: Math.max(0, Math.min(1, bestScore)),
                bbox: [clamp(x1), clamp(y1), clamp(x2), clamp(y2)],
            });
        }
    }

    return dets;
}

function groupDetectionsByCategory(detections: MappedDetection[]): GroupedDetection[] {
    const groupedMap = new Map<number, GroupedDetection>();

    detections.forEach(detection => {
        const existing = groupedMap.get(detection.classId);

        if (existing) {
            existing.detections.push(detection);
            existing.count += 1;
            existing.confidence = existing.detections.reduce((sum, d) => sum + d.confidence, 0) / existing.detections.length;
        } else {
            groupedMap.set(detection.classId, {
                ...detection,
                detections: [detection],
                count: 1,
                confidence: detection.confidence
            });
        }
    });

    return Array.from(groupedMap.values()).sort((a, b) => b.confidence - a.confidence);
}

// ----------------- Component -----------------
type Step = "capture" | "analyzing" | "results";

export default function SkinAnalyzerFeature() {
    const [step, setStep] = useState<Step>("capture");
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [detections, setDetections] = useState<MappedDetection[]>([]);
    const [groupedDetections, setGroupedDetections] = useState<GroupedDetection[]>([]);
    const [useCamera, setUseCamera] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Preload ONNX Runtime in background
        loadONNXRuntime().catch(console.error);
    }, []);

    const getDeviceId = () => {
        if (typeof window === 'undefined') return ''; // Safety for SSR
        let deviceId = localStorage.getItem('skin_analyzer_device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem('skin_analyzer_device_id', deviceId);
        }
        return deviceId;
    };

    // ----------------- Inference -----------------
    async function analyzeDataUrl(dataUrl: string) {
        setStep("analyzing");
        setError(null);
        setDetections([]);
        setGroupedDetections([]);
        setLoading(true);

        try {
            // Load ONNX Runtime
            const ort = await loadONNXRuntime();

            // Check Quota
            const quotaResponse = await fetch("/api/skin-analyzer/quota", {
                method: "POST",
                headers: {
                    'x-device-id': getDeviceId()
                }
            });

            const quotaResult = await quotaResponse.json();

            if (!quotaResponse.ok) {
                throw new Error(quotaResult.error || "Quota exceeded");
            }

            // load model
            const session = await loadModel();

            // create image element
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = dataUrl;
            await new Promise<void>((res, rej) => {
                img.onload = () => res();
                img.onerror = () => rej(new Error("Failed to load image"));
            });

            // preprocess
            const inputData = preprocessImageToTensor(img);

            // Create tensor - ONNX expects CHW format: [batch, channels, height, width]
            const inputTensor = new ort.Tensor('float32', inputData, [1, 3, INPUT_SIZE, INPUT_SIZE]);

            // run inference
            const feeds: Record<string, any> = {};
            feeds[session.inputNames[0]] = inputTensor;

            const results = await session.run(feeds);
            const outputTensor = results[session.outputNames[0]];

            const rawDetections = parseYoloOutput(
                outputTensor.data as Float32Array,
                Array.from(outputTensor.dims),
                CONF_THRESHOLD
            );

            // NMS
            const final = nonMaxSuppression(rawDetections as DetectionRaw[], IOU_THRESHOLD);

            // Get unique class IDs from detections
            const uniqueClassIds = [...new Set(final.map(d => d.classId))];

            // Fetch products for each detected class
            const productsMap = new Map<number, Product[]>();

            await Promise.all(uniqueClassIds.map(async (classId) => {
                const info = SKIN_CONCERN_DETAILS[classId];
                if (info) {
                    const products = await getProductsForSkinConcern(info.name);
                    productsMap.set(classId, products);
                }
            }));

            // Map to UI type & filter unknown class ids
            const mapped: MappedDetection[] = final
                .map((d) => {
                    const info = SKIN_CONCERN_DETAILS[d.classId];
                    if (!info) return null;
                    return {
                        ...info,
                        products: productsMap.get(d.classId) || [],
                        classId: d.classId,
                        confidence: d.score,
                        bbox: d.bbox,
                    } as MappedDetection;
                })
                .filter(Boolean) as MappedDetection[];

            setDetections(mapped);
            setGroupedDetections(groupDetectionsByCategory(mapped));
            setStep("results");
        } catch (err: any) {
            console.error("Analysis error details:", {
                error: err,
                message: err?.message,
                stack: err?.stack,
                type: typeof err,
                name: err?.name
            });

            let errorMessage = "Failed to analyze image. Please try again.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (err !== null && err !== undefined) {
                errorMessage = `Une erreur inattendue s'est produite (Code: ${err})`;
            }

            setError(errorMessage);
            setStep("capture");
        } finally {
            setLoading(false);
        }
    }

    // ----------------- Event Handlers -----------------
    const handleStartCamera = () => {
        setUseCamera(true);
    };

    const handleCapture = (dataUrl: string) => {
        setImageSrc(dataUrl);
        setUseCamera(false);
        void analyzeDataUrl(dataUrl);
    };

    const handleCancelCamera = () => {
        setUseCamera(false);
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImageSrc(result);
            void analyzeDataUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setStep("capture");
        setImageSrc(null);
        setDetections([]);
        setGroupedDetections([]);
        setUseCamera(false);
        setError(null);
    };

    // Don't render until client-side
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl m-4 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <div className="container relative mx-auto px-4 py-20 lg:py-28">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group">
                            <Sparkles className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
                            <span className="text-sm font-semibold text-primary uppercase tracking-widest">AI Technology</span>
                        </div>

                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-8 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                            Analyse de Peau
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
                            Découvrez les besoins uniques de votre peau grâce à notre technologie d'analyse avancée et recevez des recommandations personnalisées.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            {['Analyse instantanée', 'IA avancée', 'Recommandations sur mesure'].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-full border border-border/50"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <span className="text-muted-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="text-destructive hover:opacity-70 transition-opacity"
                                aria-label="dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {step === "capture" && !useCamera && (
                    <UploadView
                        onStartCamera={handleStartCamera}
                        onFileUpload={handleFileUpload}
                        onError={setError}
                    />
                )}

                {useCamera && (
                    <CameraView
                        onCapture={handleCapture}
                        onCancel={handleCancelCamera}
                        onError={setError}
                    />
                )}

                {step === "analyzing" && (
                    <div className="max-w-xl mx-auto py-12">
                        <div className="text-center space-y-8">
                            {imageSrc && (
                                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-background shadow-2xl">
                                    <img
                                        src={imageSrc}
                                        alt="Analyzing..."
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <Loader2 className="w-12 h-12 animate-spin text-white" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h2 className="font-serif text-3xl font-medium">
                                    Analyse en cours...
                                </h2>
                                <p className="text-muted-foreground">
                                    Notre IA examine votre peau pour détecter les imperfections et générer votre routine personnalisée.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === "results" && imageSrc && (
                    <AnalysisResults
                        imageSrc={imageSrc}
                        detections={detections}
                        groupedDetections={groupedDetections}
                        onReset={handleReset}
                    />
                )}
            </div>
        </div>
    );
}
