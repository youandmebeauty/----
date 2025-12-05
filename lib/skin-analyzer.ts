// types/skin-analyzer.ts
import type { Product as ImportedProduct } from "@/lib/models";

// Use the imported Product type directly
export type Product = ImportedProduct;

export interface DetectionRaw {
  classId: number;
  score: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] in input-space (640x640)
}

export interface SkinProblemInfo {
  name: string;
  description: string;
  products: Product[];
}

export interface MappedDetection extends SkinProblemInfo {
  classId: number;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface GroupedDetection extends SkinProblemInfo {
  classId: number;
  confidence: number; // Average confidence for this category
  detections: MappedDetection[]; // All individual detections for this category
  count: number; // Number of detections for this category
}