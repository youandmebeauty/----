import { type NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const MAX_SCANS_PER_DAY = 3;

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const quotaRef = adminDb.collection("skin_analyzer_quota");
    const docRef = quotaRef.doc(ip);

    const result = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      let currentCount = 0;
      let lastUpdated: Timestamp | null = null;

      if (doc.exists) {
        const data = doc.data();
        currentCount = data?.count || 0;
        lastUpdated = data?.lastUpdated || null;
      }

      // Check if it's a new day (UTC)
      if (lastUpdated) {
        const lastDate = lastUpdated.toDate();
        const now = new Date();
        
        const isSameDay = 
          lastDate.getUTCFullYear() === now.getUTCFullYear() &&
          lastDate.getUTCMonth() === now.getUTCMonth() &&
          lastDate.getUTCDate() === now.getUTCDate();

        if (!isSameDay) {
          currentCount = 0; // Reset quota for new day
        }
      }

      if (currentCount >= MAX_SCANS_PER_DAY) {
        return { allowed: false, remaining: 0 };
      }

      transaction.set(
        docRef,
        {
          ip,
          count: currentCount + 1,
          lastUpdated: Timestamp.now(),
          userAgent: request.headers.get("user-agent") || "",
        },
        { merge: true }
      );

      return { allowed: true, remaining: MAX_SCANS_PER_DAY - currentCount - 1 };
    });

    if (!result.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          error: "Vous avez atteint votre limite de 3 analyses gratuites pour aujourd'hui.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking skin analyzer quota:", error);
    return NextResponse.json(
      { allowed: false, error: "Erreur lors de la vérification du quota." },
      { status: 500 }
    );
  }
}
