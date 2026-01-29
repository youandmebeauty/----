"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createCoffret } from "@/lib/services/coffret-service"
import { getProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models"
import { ArrowLeft, Image as ImageIcon, X, Plus } from "lucide-react"
import { CldUploadWidget } from 'next-cloudinary'

function AddCoffretContent() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: [] as string[],
        productIds: [] as string[],
    })
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts()
                setProducts(data)
            } catch (error) {
                console.error("Failed to load products", error)
                toast({
                    title: "Erreur",
                    description: "Impossible de charger la liste des produits.",
                    variant: "destructive"
                })
            }
        }
        loadProducts()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const toggleProductSelection = (productId: string) => {
        setFormData(prev => {
            const currentIds = prev.productIds
            if (currentIds.includes(productId)) {
                return { ...prev, productIds: currentIds.filter(id => id !== productId) }
            } else {
                return { ...prev, productIds: [...currentIds, productId] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (formData.images.length === 0) {
                toast({
                    title: "Erreur",
                    description: "Veuillez ajouter au moins une image.",
                    variant: "destructive"
                })
                setLoading(false)
                return
            }

            await createCoffret({
                name: formData.name,
                description: formData.description,
                price: Number.parseFloat(formData.price),
                stock: formData.stock ? Number.parseInt(formData.stock, 10) : 0,
                images: formData.images,
                productIds: formData.productIds,
            })

            toast({
                title: "Coffret créé",
                description: "Le coffret a été créé avec succès.",
            })

            router.push("/admin/dashboard")
        } catch (error) {
            console.error("Error creating coffret:", error)
            toast({
                title: "Erreur",
                description: "Échec de la création du coffret. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <main className="container relative mx-auto px-6 py-8">
                    <div className="flex items-center mb-8">
                        <Button variant="ghost" onClick={() => router.back()} className="mr-4 hover:bg-primary/10 hover:text-primary rounded-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <h1 className="font-serif text-3xl font-medium tracking-tight">Ajouter un Coffret</h1>
                    </div>

                    <Card className="max-w-2xl mx-auto bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl">Détails du Coffret</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Nom du coffret *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Entrez le nom du coffret"
                                        className="bg-background/50"
                                    />
                                </div>

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
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label>Images du coffret *</Label>

                                    {/* Images Gallery */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {formData.images.map((image, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                                    <img
                                                        src={image}
                                                        alt={`Coffret image ${index + 1}`}
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
                                        placeholder="Description du coffret"
                                        className="bg-background/50"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">Produits inclus</Label>
                                    <Input
                                        placeholder="Rechercher un produit..."
                                        className="mb-2 bg-background/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />  <ScrollArea className="h-60 rounded-md border border-border bg-background/50">

                                    <div className="border border-border rounded-md p-4 max-h-60 overflow-y-auto bg-background/50 ">
                                        {products.length > 0 ? (
                                            <div className="space-y-2">
                                                {products
                                                    .filter(product =>
                                                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(product => (
                                                        <div key={product.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`prod-${product.id}`}
                                                                checked={formData.productIds.includes(product.id)}
                                                                onCheckedChange={() => toggleProductSelection(product.id)}
                                                            />
                                                            <Label
                                                                htmlFor={`prod-${product.id}`}
                                                                className="text-sm cursor-pointer flex-1"
                                                            >
                                                                {product.name} ({product.brand})
                                                            </Label>
                                                        </div>
                                                    ))}
                                                {products.filter(product =>
                                                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="text-muted-foreground text-sm text-center">Aucun produit trouvé</div>
                                                    )}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground text-sm text-center">Aucun produit disponible</div>
                                        )}
                                    </div>
                                    </ScrollArea>
                                    <p className="text-xs text-muted-foreground mt-1">Sélectionnez les produits inclus dans ce coffret.</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? "Création en cours..." : "Créer le Coffret"}
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

export default function AddCoffretPage() {
    return (
        <AdminRouteGuard>
            <AddCoffretContent />
        </AdminRouteGuard>
    )
}
