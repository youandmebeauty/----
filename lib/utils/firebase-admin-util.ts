import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length === 0) {
    const rawKey = process.env.FIREBASE_ADMIN_KEY
    if (!rawKey) {
      throw new Error("FIREBASE_ADMIN_KEY is required to initialize Firebase Admin")
    }

    let serviceAccount: Record<string, string>
    try {
      serviceAccount = JSON.parse(rawKey)
    } catch {
      throw new Error("FIREBASE_ADMIN_KEY must contain valid service-account JSON")
    }

    // Fix for escaped private key newlines
    if (typeof serviceAccount.private_key !== "string" || !serviceAccount.private_key) {
      throw new Error("FIREBASE_ADMIN_KEY is missing private_key")
    }
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApp();
}

const adminApp = initAdmin();
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
