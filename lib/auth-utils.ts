import { getAuth } from "firebase-admin/auth"
import { adminApp } from "./firebase-admin"
import type { NextRequest } from "next/server"

export async function verifyAdminToken(request: NextRequest): Promise<{ valid: boolean; uid?: string; error?: string }> {
  try {
    const token = request.cookies.get("admin-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return { valid: false, error: "No token provided" }
    }

    const auth = getAuth(adminApp)
    const decodedToken = await auth.verifyIdToken(token)
    
    // Check if user has admin claim
    if (decodedToken.admin !== true) {
      return { valid: false, error: "User is not an admin" }
    }

    return { valid: true, uid: decodedToken.uid }
  } catch (error) {
    console.error("Error verifying admin token:", error)
    return { valid: false, error: "Invalid token" }
  }
}

