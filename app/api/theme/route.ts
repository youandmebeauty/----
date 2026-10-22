import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/utils/firebase-admin-util'
import { verifyAdminToken } from '@/lib/utils/auth-utils'
import { NextRequest } from 'next/server'

const DOC_PATH = 'config/fete_theme'

export async function GET() {
  try {
    const ref = adminDb.doc ? adminDb.doc(DOC_PATH) : adminDb.collection('config').doc('fete_theme')
    // firebase-admin get
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ key: 'none' })
    }
    const data = snap.data()
    return NextResponse.json({ key: data?.key ?? 'none' })
  } catch (err) {
    console.error('GET /api/theme error', err)
    return NextResponse.json({ key: 'none' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request)
    if (!auth.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const key = typeof body?.key === 'string' ? body.key.trim() : ''
    if (!/^[a-z0-9_-]{1,64}$/i.test(key)) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }

    const ref = adminDb.doc ? adminDb.doc(DOC_PATH) : adminDb.collection('config').doc('fete_theme')
    await ref.set({ key }, { merge: true })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/theme error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
