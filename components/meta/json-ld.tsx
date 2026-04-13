import { headers } from "next/headers"

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>

type JsonLdProps = {
  data: JsonLdValue
  nonce?: string
}

export async function JsonLd({ data, nonce }: JsonLdProps) {
  const resolvedNonce = nonce ?? (await headers()).get("x-nonce") ?? undefined

  return (
    <script
      nonce={resolvedNonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
