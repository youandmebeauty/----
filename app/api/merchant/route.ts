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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function toPlainText(value?: string | null): string {
  if (!value) return ""
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function formatPrice(value: number): string {
  const normalized = Number.isFinite(value) ? value : 0
  return `${normalized.toFixed(2)} ${DEFAULT_CURRENCY}`
}

function isInStock(product: Product): boolean {
  if (product.hasColorVariants && Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
    return product.colorVariants.some((variant) => (variant.quantity ?? 0) > 0)
  }
  return (product.quantity ?? 0) > 0
}

function normalizeImageUrl(value: string, baseUrl: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`
  }

  if (trimmed.startsWith("/")) {
    return `${baseUrl}${trimmed}`
  }

  return `${baseUrl}/${trimmed}`
}

function getPrimaryAndAdditionalImages(product: Product, baseUrl: string): { primary?: string, additional: string[] } {
  // Get all product images including variant images, with fallback to product.image and de-duplication
  const variantImages = product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0
    ? product.colorVariants.map(variant => variant.image).filter(Boolean)
    : []

  const mainImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean)

  const productImages = Array.from(
    new Set([...(variantImages || []), ...(mainImages || [])].filter(Boolean))
  )

  // Normalize and deduplicate URLs
  const seen = new Set<string>()
  const normalizedImages = productImages
    .map((value) => normalizeImageUrl(value as string, baseUrl))
    .filter((value): value is string => !!value)
    .filter((value) => {
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })

  return {
    primary: normalizedImages[0],
    additional: normalizedImages.slice(1),
  }
}

function buildItemXml(product: Product, baseUrl: string): string {
  const slug = generateSlug(product.name, { includeBrand: product.brand })
  const link = `${baseUrl}/product/${product.id}-${slug}`
  const title = escapeXml(product.name)

  const rawDescription =
    toPlainText(product.longDescription ?? product.description) ||
    product.name ||
    ""

  const description = escapeXml(rawDescription)
  const brand = product.brand ? escapeXml(product.brand) : ""
  const sku = escapeXml(product.id)

  const price = formatPrice(product.price)
  const salePriceValue = typeof product.promoPrice === "number" ? product.promoPrice : null
  const hasSalePrice = salePriceValue !== null && salePriceValue < product.price
  const salePrice = hasSalePrice ? formatPrice(salePriceValue as number) : null

  const availability = isInStock(product) ? "in stock" : "out of stock"
  const { primary, additional } = getPrimaryAndAdditionalImages(product, baseUrl)
  const imageLink = primary ? escapeXml(primary) : ""
  const additionalImages = additional.slice(0, 9).map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`)

  const productTypeParts = [product.category, product.subcategory].filter(Boolean) as string[]
  const productType = productTypeParts.length ? escapeXml(productTypeParts.join(" > ")) : ""

  const lines = [
    "<item>",
    `  <g:id>${sku}</g:id>`,
    `  <g:title>${title}</g:title>`,
    `  <g:description>${description}</g:description>`,
    `  <g:link>${escapeXml(link)}</g:link>`,
    imageLink ? `  <g:image_link>${imageLink}</g:image_link>` : "",
    ...additionalImages.map((line) => `  ${line}`),
    `  <g:availability>${availability}</g:availability>`,
    `  <g:condition>new</g:condition>`,
    `  <g:price>${price}</g:price>`,
    hasSalePrice && salePrice ? `  <g:sale_price>${salePrice}</g:sale_price>` : "",
    brand ? `  <g:brand>${brand}</g:brand>` : "",
    productType ? `  <g:product_type>${productType}</g:product_type>` : "",
    "</item>",
  ]

  return lines.filter(Boolean).join("\n")
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    const products = await getProducts()

    // Filter out products without images (required by Google Merchant Center)
    const validProducts = products.filter((product) => {
      const { primary } = getPrimaryAndAdditionalImages(product, baseUrl)
      return primary !== undefined
    })

    const itemsXml = validProducts.map((product) => buildItemXml(product, baseUrl)).join("\n")

    const xml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">",
      "<channel>",
      "  <title>You &amp; Me Beauty</title>",
      `  <link>${escapeXml(baseUrl)}</link>`,
      "  <description>Catalogue produits</description>",
      itemsXml,
      "</channel>",
      "</rss>",
    ].join("\n")

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Merchant feed error:", error)
    return NextResponse.json({ error: "Failed to generate merchant feed" }, { status: 500 })
  }
}
