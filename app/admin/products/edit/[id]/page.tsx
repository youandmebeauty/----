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
import type { Product } from "@/lib/models"
import { ArrowLeft, Trash2, Image as ImageIcon, X } from "lucide-react"
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
    price: "",
    category: "",
    subcategory: "",
    description: "",
    longDescription: "",
    image: "",
    stock: "",
    featured: false,
    ingredients: "",
    skinType: [] as string[],
    hairType: [] as string[],
  })

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
          price: productData.price.toString(),
          category: productData.category,
          subcategory: productData.subcategory || "",
          description: productData.description,
          longDescription: productData.longDescription || "",
          image: productData.image,
          stock: productData.stock.toString(),
          featured: productData.featured || false,
          ingredients: productData.ingredients?.join(", ") || "",
          skinType: productData.skinType || [],
          hairType: productData.hairType || [],
        })
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
      const productData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        longDescription: formData.longDescription || formData.description,
        image: formData.image,
        stock: Number.parseInt(formData.stock),
        featured: formData.featured,
        ingredients: formData.ingredients ? formData.ingredients.split(",").map((i) => i.trim()) : [],
        skinType: formData.skinType.length > 0 ? formData.skinType : undefined,
        hairType: formData.hairType.length > 0 ? formData.hairType : undefined,
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="bg-background/50"
                    />
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

                <div className="space-y-4">
                  <Label>Image du produit *</Label>
                  <div className="flex flex-col gap-4">
                    {formData.image && (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
                        <img
                          src={formData.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result: any) => {
                        if (result.info?.secure_url) {
                          setFormData(prev => ({ ...prev, image: result.info.secure_url }))
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
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {formData.image ? "Changer l'image" : "Télécharger une image"}
                          </Button>
                        );
                      }}
                    </CldUploadWidget>

                    {/* Hidden input to ensure validation works if needed, though we handle it via state */}
                    <input
                      type="hidden"
                      name="image"
                      value={formData.image}
                      required
                    />
                  </div>
                </div>

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
