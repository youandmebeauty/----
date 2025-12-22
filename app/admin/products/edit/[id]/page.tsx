"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/product-service"
import type { Product, ColorVariant } from "@/lib/models"
import { ArrowLeft, Trash2, Image as ImageIcon, X, Plus } from "lucide-react"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { CldUploadWidget } from 'next-cloudinary';
import { SHOP_CATEGORIES } from "@/lib/category-data"

function EditProductContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    barcode: "",
    price: "",
    category: "",
    subcategory: "",
    description: "",
    longDescription: "",
    howToUse: "",
    images: [] as string[],
    quantity: "",
    featured: false,
    ingredients: "",
    skinType: [] as string[],
    hairType: [] as string[],
    hasColorVariants: false,
  })
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const productData = await getProductById(id)
      if (productData) {
        setProduct(productData)
        setFormData({
          name: productData.name,
          brand: productData.brand || "",
          barcode: productData.barcode || "",
          price: productData.price.toString(),
          category: productData.category,
          subcategory: productData.subcategory || "",
          description: productData.description,
          longDescription: productData.longDescription || "",
          howToUse: productData.howToUse || "",
          images: productData.images || (productData.image ? [productData.image] : []),
          quantity: productData.quantity.toString(),
          featured: productData.featured || false,
          ingredients: productData.ingredients?.join(", ") || "",
          skinType: productData.skinType || [],
          hairType: productData.hairType || [],
          hasColorVariants: productData.hasColorVariants || false,
        })
        setColorVariants(productData.colorVariants || [])
      } else {
        toast({
          title: "Erreur",
          description: "Produit introuvable.",
          variant: "destructive",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement du produit.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  const handleColorVariantsToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, hasColorVariants: checked }))
    if (!checked) {
      setColorVariants([])
    }
  }

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      { colorName: "", color: "#000000", image: "", quantity: 0, barcode: ""},
    ])
  }

  const removeColorVariant = (index: number) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const updateColorVariant = (index: number, field: keyof ColorVariant, value: string | number) => {
    setColorVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    )
  }

  const toggleSkinType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter((t) => t !== type)
        : [...prev.skinType, type],
    }))
  }

  const toggleHairType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      hairType: prev.hairType.includes(type)
        ? prev.hairType.filter((t) => t !== type)
        : [...prev.hairType, type],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)

    try {
      const productData: any = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        barcode: formData.barcode.trim(),
        price: Number.parseFloat(formData.price) || 0,
        category: formData.category,
        subcategory: formData.subcategory?.trim() || undefined,
        description: formData.description.trim(),
        longDescription: formData.longDescription?.trim() || formData.description.trim(),
        howToUse: formData.howToUse?.trim() || "",
        quantity: formData.hasColorVariants 
          ? colorVariants.reduce((sum, v) => sum + v.quantity, 0)
          : Number.parseInt(formData.quantity, 10) || 0,
        featured: formData.featured,
        ingredients: formData.ingredients ? formData.ingredients.split(",").map((i) => i.trim()).filter((i) => i.length > 0) : [],
        skinType: formData.skinType || [],
        hairType: formData.hairType || [],
        hasColorVariants: formData.hasColorVariants,
      }

      // Only include images if there are no color variants
      if (!formData.hasColorVariants) {
        productData.images = formData.images
        // Set first image as the main image for backward compatibility
        productData.image = formData.images[0] || ""
      }

      if (formData.hasColorVariants && colorVariants.length > 0) {
        productData.colorVariants = colorVariants.map(v => ({
          colorName: v.colorName.trim(),
          color: v.color || "#000000",
          image: v.image.trim(),
          quantity: Number(v.quantity) || 0,
          barcode: v.barcode?.trim() || "",
        }))
      } else {
        // If no color variants, ensure we exclude color variants from the product data
        delete productData.colorVariants
      }

      await updateProduct(product.id, productData)

      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      })

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du produit. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return

    setDeleting(true)

    try {
      await deleteProduct(product.id)

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      })

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: "Échec de la suppression du produit. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingAnimation size={140} className="text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <main className="container relative mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4 hover:bg-primary/10 hover:text-primary rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="font-serif text-3xl font-medium tracking-tight">Modifier le Produit</h1>
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-full">
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Modifier le Produit: {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Entrez le nom du produit"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Marque *</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    placeholder="Entrez la marque du produit"
                    className="bg-background/50"
                  />
                </div>

                {!formData.hasColorVariants && (
                  <div>
                    <Label htmlFor="barcode">Code à barre</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Entrez le code à barre du produit"
                      className="bg-background/50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">
                      Quantité {formData.hasColorVariants ? "(calculée automatiquement)" : "*"}
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={formData.hasColorVariants 
                        ? colorVariants.reduce((sum, v) => sum + v.quantity, 0).toString()
                        : formData.quantity}
                      onChange={handleInputChange}
                      required={!formData.hasColorVariants}
                      disabled={formData.hasColorVariants}
                      placeholder="0"
                      className="bg-background/50"
                    />
                    {formData.hasColorVariants && (
                      <p className="text-xs text-muted-foreground mt-1">
                        La quantité totale est calculée à partir des variantes de couleur
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        category: newCategory,
                        subcategory: "" // Reset subcategory when category changes
                      }));
                    }}
                    className="w-full border rounded-md px-3 py-2 bg-background/50"
                    required
                  >
                    {SHOP_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 bg-background/50"
                    disabled={!formData.category || !SHOP_CATEGORIES.find(c => c.id === formData.category)?.subcategories?.length}
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {formData.category && SHOP_CATEGORIES.find(c => c.id === formData.category)?.subcategories?.map((sub) => {
                      if (sub.subcategories && sub.subcategories.length > 0) {
                        return (
                          <optgroup key={sub.id} label={sub.label}>
                            {sub.subcategories.map((child) => (
                              <option key={child.id} value={child.id}>
                                {child.label}
                              </option>
                            ))}
                          </optgroup>
                        )
                      }
                      return (
                        <option key={sub.id} value={sub.id}>
                          {sub.label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Skin Type Filter - Show for Soins category with visage/corps subcategory */}
                {formData.category === "soins" && (formData.subcategory === "visage" || formData.subcategory === "corps" || !formData.subcategory) && (
                  <div>
                    <Label>Type de peau</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {SHOP_CATEGORIES.find(c => c.id === "soins")?.filters?.find(f => f.id === "skinType")?.options.map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={formData.skinType.includes(type)}
                            onCheckedChange={() => toggleSkinType(type)}
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hair Type Filter - Show for Soins category with cheveux subcategory */}
                {formData.category === "soins" && (formData.subcategory === "cheveux" || !formData.subcategory) && (
                  <div>
                    <Label>Type de cheveux</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {SHOP_CATEGORIES.find(c => c.id === "soins")?.filters?.find(f => f.id === "hairType")?.options.map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={formData.hairType.includes(type)}
                            onCheckedChange={() => toggleHairType(type)}
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {!formData.hasColorVariants && (
                  <div className="space-y-4">
                    <Label>Images du produit *</Label>
                    
                    {/* Images Gallery */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                            <img
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                Principal
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    const newImages = [...formData.images]
                                    const temp = newImages[0]
                                    newImages[0] = newImages[index]
                                    newImages[index] = temp
                                    setFormData(prev => ({ ...prev, images: newImages }))
                                  }}
                                  title="Définir comme image principale"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    images: prev.images.filter((_, i) => i !== index) 
                                  }))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result: any) => {
                        if (result.info?.secure_url) {
                          setFormData(prev => ({ 
                            ...prev, 
                            images: [...prev.images, result.info.secure_url] 
                          }))
                        }
                      }}
                    >
                      {({ open }) => {
                        return (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => open()}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {formData.images.length === 0 ? "Ajouter des images" : "Ajouter une autre image"}
                          </Button>
                        );
                      }}
                    </CldUploadWidget>

                    {formData.images.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Ajoutez au moins une image du produit. La première image sera l'image principale.
                      </p>
                    )}

                    {/* Hidden input to ensure validation works */}
                    <input
                      type="hidden"
                      name="images"
                      value={formData.images.join(',')}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Description courte du produit"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="longDescription">Description longue</Label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Description détaillée du produit"
                    className="bg-background/50"
                  />
                </div>
                {formData.category === "soins"  && (
                                  <div>
                                    <Label>Conseil d'utilisation</Label>
                                    <Textarea
                                    id="howToUse"
                                    name="howToUse"
                                    value={formData.howToUse}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Mode d'emploi du produit"
                                    className="bg-background/50"
                                  />
                                  </div>
                                )}

                <div>
                  <Label htmlFor="ingredients">Ingrédients (séparés par des virgules)</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Water, Glycerin, Hyaluronic Acid, ..."
                    className="bg-background/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" checked={formData.featured} onCheckedChange={handleCheckboxChange} />
                  <Label htmlFor="featured">Produit en vedette</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="hasColorVariants" checked={formData.hasColorVariants} onCheckedChange={handleColorVariantsToggle} />
                  <Label htmlFor="hasColorVariants">A des variantes de couleur</Label>
                </div>

                {formData.hasColorVariants && (
                  <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-background/30">
                    <div className="flex items-center justify-between">
                      <Label>Variantes de couleur</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addColorVariant}
                        className="rounded-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une variante
                      </Button>
                    </div>

                    {colorVariants.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune variante ajoutée. Cliquez sur "Ajouter une variante" pour commencer.
                      </p>
                    )}

                    {colorVariants.map((variant, index) => (
                      <Card key={index} className="bg-background/50 border-border/50">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Variante {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeColorVariant(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`variant-color-picker-${index}`}>Couleur *</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  id={`variant-color-picker-${index}`}
                                  type="color"
                                  value={variant.color || "#000000"}
                                  onChange={(e) => updateColorVariant(index, "color", e.target.value)}
                                  className="w-16 h-10 rounded-lg border border-border cursor-pointer bg-background/50"
                                />
                                <Input
                                  type="text"
                                  value={variant.color || "#000000"}
                                  onChange={(e) => updateColorVariant(index, "color", e.target.value)}
                                  placeholder="#000000"
                                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                  className="bg-background/50 flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`variant-color-name-${index}`}>Nom de la couleur *</Label>
                              <Input
                                id={`variant-color-name-${index}`}
                                value={variant.colorName}
                                onChange={(e) => updateColorVariant(index, "colorName", e.target.value)}
                                placeholder="Ex: Rouge, Bleu, Noir..."
                                required
                                className="bg-background/50"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`variant-quantity-${index}`}>Quantité *</Label>
                            <Input
                              id={`variant-quantity-${index}`}
                              type="number"
                              min="0"
                              value={variant.quantity}
                              onChange={(e) => updateColorVariant(index, "quantity", Number.parseInt(e.target.value) || 0)}
                              required
                              className="bg-background/50"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`variant-barcode-${index}`}>Code à barre</Label>
                            <Input
                              id={`variant-barcode-${index}`}
                              value={variant.barcode || ""}
                              onChange={(e) => updateColorVariant(index, "barcode", e.target.value)}
                              placeholder="Entrez le code à barre de cette variante"
                              className="bg-background/50"
                            />
                          </div>

                          <div>
                            <Label>Image de la variante *</Label>
                            <div className="flex flex-col gap-4 mt-2">
                              {variant.image && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                                  <img
                                    src={variant.image}
                                    alt={`${variant.colorName} preview`}
                                    className="w-full h-full object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                    onClick={() => updateColorVariant(index, "image", "")}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}

                              <CldUploadWidget
                                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                onSuccess={(result: any) => {
                                  if (result.info?.secure_url) {
                                    updateColorVariant(index, "image", result.info.secure_url)
                                  }
                                }}
                              >
                                {({ open }) => {
                                  return (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => open()}
                                      className="w-full sm:w-auto"
                                    >
                                      <ImageIcon className="mr-2 h-4 w-4" />
                                      {variant.image ? "Changer l'image" : "Télécharger une image"}
                                    </Button>
                                  )
                                }}
                              </CldUploadWidget>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={loading} className="rounded-full px-8">
                    {loading ? "Mise à jour..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full px-8">
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default function EditProductPage() {
  return (
    <AdminRouteGuard>
      <EditProductContent />
    </AdminRouteGuard>
  )
}