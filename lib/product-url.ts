export function generateSlung(name: string, options?: {
  includeCategory?: string
  includeBrand?: string
}): string {
  let slung = name
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
    const brandSlung = options.includeBrand
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
    slung = `${brandSlung}-${slung}`
  }
  
  if (options?.includeCategory) {
    const categorySlung = options.includeCategory
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
    slung = `${categorySlung}-${slung}`
  }
  
  return slung 
}