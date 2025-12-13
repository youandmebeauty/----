export function generateSlug(name: string, options?: {
  includeCategory?: string
  includeBrand?: string
}): string {
  let slug = name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Handle accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-+|-+$/g, '') // Trim hyphens
  
  // Optionally include brand for better SEO
  if (options?.includeBrand) {
    const brandSlug = options.includeBrand
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
    slug = `${brandSlug}-${slug}`
  }
  
  if (options?.includeCategory) {
    const categorySlug = options.includeCategory
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
    slug = `${categorySlug}-${slug}`
  }
  
  return slug
}