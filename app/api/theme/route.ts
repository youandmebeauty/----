import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/utils/firebase-admin-util'

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key } = body
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

    const ref = adminDb.doc ? adminDb.doc(DOC_PATH) : adminDb.collection('config').doc('fete_theme')
    await ref.set({ key }, { merge: true })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/theme error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
