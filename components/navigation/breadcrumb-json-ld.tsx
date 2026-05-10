import { headers } from "next/headers"

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>
}

export async function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const nonce = (await headers()).get("x-nonce") || ""
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://youandme.tn"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": item.url
      }))
    ]
  }

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
