import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!);

    // Fix for escaped private key newlines
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
