type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>

type JsonLdProps = {
  data: JsonLdValue
  nonce?: string
}

export function JsonLd({ data, nonce }: JsonLdProps) {
  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
