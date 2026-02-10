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

function getProductImages(product: Product): string[] {
  const images: string[] = []

  if (product.hasColorVariants && Array.isArray(product.colorVariants)) {
    product.colorVariants.forEach((variant) => {
      if (variant.image) images.push(variant.image)
    })
  }

  if (Array.isArray(product.images)) {
    product.images.forEach((image) => {
      if (image) images.push(image)
    })
  } else if (product.image) {
    images.push(product.image)
  }

  return Array.from(new Set(images))
}

function buildItemXml(product: Product, baseUrl: string): string {
  const slug = generateSlug(product.name, { includeBrand: product.brand })
  const link = `${baseUrl}/product/${product.id}-${slug}`
  const title = escapeXml(product.name)
  const description = escapeXml(toPlainText(product.longDescription ?? product.description))
  const brand = product.brand ? escapeXml(product.brand) : ""
  const sku = escapeXml(product.id)

  const price = formatPrice(product.price)
  const salePriceValue = typeof product.promoPrice === "number" ? product.promoPrice : null
  const hasSalePrice = salePriceValue !== null && salePriceValue < product.price
  const salePrice = hasSalePrice ? formatPrice(salePriceValue as number) : null

  const availability = isInStock(product) ? "in stock" : "out of stock"
  const images = getProductImages(product)
  const imageLink = images[0] ? escapeXml(images[0]) : ""
  const additionalImages = images.slice(1, 10).map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`)

  const productTypeParts = [product.category, product.subcategory].filter(Boolean) as string[]
  const productType = productTypeParts.length ? escapeXml(productTypeParts.join(" > ")) : ""

  const gtin = product.barcode ? escapeXml(product.barcode) : ""

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
    gtin ? `  <g:gtin>${gtin}</g:gtin>` : "",
    "</item>",
  ]

  return lines.filter(Boolean).join("\n")
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    const products = await getProducts()

    const itemsXml = products.map((product) => buildItemXml(product, baseUrl)).join("\n")

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
