
import "server-only"
import { NextResponse } from "next/server"
import { getProducts } from "@/lib/services/product-service"
import { generateSlug } from "@/lib/urls/product-url"
import type { Product } from "@/lib/models/models"

export const dynamic = "force-dynamic"

const DEFAULT_BASE_URL = "https://youandme.tn"
const DEFAULT_CURRENCY = "TND"

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/$/, "")
  }
  return DEFAULT_BASE_URL
}

function toPlainText(value?: string | null): string {
  if (!value) return ""
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function formatPrice(value: number): string {
  const normalized = Number.isFinite(value) ? value : 0
  return `${normalized.toFixed(2)} ${DEFAULT_CURRENCY}`
}

// CSV escape
function csvEscape(value: string): string {
  if (value == null) return ""
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function isInStock(product: Product): boolean {
  if (
    product.hasColorVariants &&
    Array.isArray(product.colorVariants) &&
    product.colorVariants.length > 0
  ) {
    return product.colorVariants.some((v) => (v.quantity ?? 0) > 0)
  }
  return (product.quantity ?? 0) > 0
}

function getPrimaryImage(product: Product, baseUrl: string): string {
  const img =
    product.images?.[0] ||
    product.image ||
    ""

  if (!img) return ""

  if (img.startsWith("http")) return img
  if (img.startsWith("/")) return `${baseUrl}${img}`
  return `${baseUrl}/${img}`
}

function buildCsvRow(product: Product, baseUrl: string): string {
  const slug = generateSlug(product.name, { includeBrand: product.brand })
  const link = `${baseUrl}/product/${product.id}-${slug}`

  const title = product.name
  const description =
    toPlainText(product.longDescription ?? product.description) || product.name

  const price = formatPrice(product.price)

  const salePrice =
    typeof product.promoPrice === "number" && product.promoPrice < product.price
      ? formatPrice(product.promoPrice)
      : ""

  const availability = isInStock(product) ? "in stock" : "out of stock"
  const image = getPrimaryImage(product, baseUrl)

  const category = [product.category, product.subcategory]
    .filter(Boolean)
    .join(" > ")

  return [
    csvEscape(product.id),
    csvEscape(title),
    csvEscape(description),
    csvEscape(link),
    csvEscape(image),
    csvEscape(price),
    csvEscape(salePrice),
    csvEscape(availability),
    csvEscape(product.brand || ""),
    csvEscape(category),
  ].join(",")
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    const products = await getProducts()


    const validProducts = products.filter((p) => {
      return !!getPrimaryImage(p, baseUrl)
    })

const header = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "price",
  "sale_price",
  "availability",
  "brand",
  "category",
].join(",")

    const rows = validProducts.map((p) => buildCsvRow(p, baseUrl))

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "inline; filename=sale-products.csv",
      },
    })
  } catch (error) {
    console.error("CSV feed error:", error)
    return NextResponse.json(
      { error: "Failed to generate CSV feed" },
      { status: 500 }
    )
  }
}