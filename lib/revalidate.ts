import { revalidateTag } from "next/cache"

export async function revalidateProducts(action: string, meta: any = {}) {
  try {
    await revalidateTag("products", "default")
    console.info(
      `[products revalidate] action=${action} meta=${JSON.stringify(meta)} time=${new Date().toISOString()}`
    )
  } catch (e) {
    console.warn("[products revalidate] failed:", e)
  }
}

export default revalidateProducts
