export interface Category {
    id: string
    label: string
    subcategories?: Subcategory[]
    filters?: Filter[]
}

export interface Subcategory {
    id: string
    label: string
    subcategories?: { id: string; label: string }[]
}

export interface Filter {
    id: string
    label: string
    options: string[]
}

export const SHOP_CATEGORIES: Category[] = [
    {
        id: "soins",
        label: "Soins",
        subcategories: [
            { id: "visage", label: "Soin du Visage" },
            { id: "corps", label: "Soin du Corps" },
            { id: "cheveux", label: "Soin des Cheveux" },
            { id: "complement-nutritionnel", label: "Compléments Nutritionnels" },
        ],
        filters: [
            {
                id: "skinType",
                label: "Type de peau",
                options: [
                    "Peau sèche",
                    "Peau grasse",
                    "Peau mixte",
                    "Peau sensible",
                    "Peau mature",
                    "Peau acnéique",
                    "Peau normale",
                    "Peau déshydratée",
                    "Peau terne",
                    "Peau atopique",
                                    ],
            },
            {
                id: "hairType",
                label: "Type de cheveux",
                options: [
                    "Cheveux secs",
                    "Cheveux gras",
                    "Cheveux normaux",
                    "Cheveux mixtes",
                    "Cheveux bouclés",
                    "Cheveux ondulés",
                    "Cheveux crépus",
                    "Cheveux colorés",
                    "Cheveux abîmés",
                    "Cheveux fins",
                    "Cheveux épais",
                    
                ],
            },
        ],
    },
    {
        id: "maquillage",
        label: "Maquillage",
        subcategories: [
            {
                id: "teint",
                label: "Teint",
                subcategories: [
                    { id: "foundation", label: "Fonds de Teint" },
                    { id: "bb-cream", label: "BB Crème" },
                    { id: "cc-cream", label: "CC Crème" },
                    { id: "dd-cream", label: "DD Crème" },
                    { id: "concealer", label: "Correcteurs & Anti-cernes" },
                    { id: "powder-loose", label: "Poudres Libres" },
                    { id: "powder-compact", label: "Poudres Compactes" },
                    { id: "powder-mattifying", label: "Poudres Matifiantes" },
                    { id: "powder-translucent", label: "Poudres Translucides" },
                    { id: "primer", label: "Bases de Teint" },
                    { id: "primer-mattifying", label: "Primers Matifiants" },
                    { id: "primer-illuminating", label: "Primers Illuminateurs" },
                    { id: "primer-pores", label: "Primers Anti-pores" },
                    { id: "setting-spray", label: "Brumes Fixatrices" },
                ]
            },
            {
                id: "sculpter",
                label: "Sculpter & Illuminer",
                subcategories: [
                    { id: "blush-powder", label: "Blush Poudre" },
                    { id: "blush-cream", label: "Blush Crème" },
                    { id: "blush-liquid", label: "Blush Liquide" },
                    { id: "bronzer", label: "Bronzer" },
                    { id: "contouring-powder", label: "Contouring Poudre" },
                    { id: "contouring-cream", label: "Contouring Crème" },
                    { id: "contouring-stick", label: "Contouring Stick" },
                    { id: "highlighter-powder", label: "Enlumineurs Poudre" },
                    { id: "highlighter-liquid", label: "Enlumineurs Liquides" },
                    { id: "highlighter-stick", label: "Enlumineurs Stick" },
                    { id: "strobing-cream", label: "Strobing Crème" },
                ]
            },
            {
                id: "yeux",
                label: "Yeux",
                subcategories: [
                    { id: "eyeshadow-powder", label: "Fards à Paupières Poudre" },
                    { id: "eyeshadow-cream", label: "Fards à Paupières Crème" },
                    { id: "eyeshadow-liquid", label: "Fards à Paupières Liquides" },
                    { id: "eyeshadow-palette", label: "Palettes Yeux" },
                    { id: "eyeliner-liquid", label: "Eyeliners Liquides" },
                    { id: "eyeliner-gel", label: "Eyeliners Gel" },
                    { id: "eyeliner-waterproof", label: "Eyeliners Waterproof" },
                    { id: "eyeliner-pencil", label: "Eyeliners Crayons" },
                    { id: "eyeliner-felt", label: "Eyeliners Feutres" },
                    { id: "concealer", label: "Anti-cernes" },
                    { id: "kohl", label: "Khôl / Kajal" },
                    { id: "mascara-lengthening", label: "Mascaras Allongeants" },
                    { id: "mascara-volumizing", label: "Mascaras Volumateurs" },
                    { id: "mascara-curling", label: "Mascaras Courbants" },
                    { id: "mascara-waterproof", label: "Mascaras Waterproof" },
                    { id: "mascara-lower", label: "Mascaras Cils Inférieurs" },
                    { id: "eye-pencil", label: "Crayons Yeux" },
                    { id: "eye-primer", label: "Bases Yeux" },
                    { id: "false-lashes", label: "Faux-cils" },
                    { id: "lash-glue", label: "Colle à Faux-cils" },
                ]
            },
            {
                id: "sourcils",
                label: "Sourcils",
                subcategories: [
                    { id: "eyebrow-pencil", label: "Crayons Sourcils" },
                    { id: "eyebrow-gel-tinted", label: "Gels Sourcils Teintés" },
                    { id: "eyebrow-gel-clear", label: "Gels Sourcils Transparents" },
                    { id: "eyebrow-powder", label: "Poudres Sourcils" },
                    { id: "eyebrow-pomade", label: "Pomades Sourcils" },
                    { id: "eyebrow-mascara", label: "Mascaras Sourcils" },
                    { id: "eyebrow-kit", label: "Kits Sourcils" },
                    { id: "soap-brows", label: "Soap Brows" },
                    { id: "brow-stencil", label: "Stencils Sourcils" },
                ]
            },
            {
                id: "levres",
                label: "Lèvres",
                subcategories: [
                    { id: "lipstick-matte", label: "Rouges à Lèvres Mats" },
                    { id: "lipstick-satin", label: "Rouges à Lèvres Satinés" },
                    { id: "lipstick-glossy", label: "Rouges à Lèvres Brillants" },
                    { id: "lipstick-cream", label: "Rouges à Lèvres Crème" },
                    { id: "lipgloss", label: "Gloss" },
                    { id: "lip-pencil", label: "Crayons Lèvres" },
                    { id: "lip-stain", label: "Encres à Lèvres" },
                    { id: "tinted-balm", label: "Baumes Teintés" },
                    { id: "lip-oil", label: "Huiles à Lèvres" },
                    { id: "lip-plumper", label: "Repulpants Lèvres" },
                    { id: "lip-primer", label: "Bases Lèvres" },
                ]
            },
            {
                id: "ongles",
                label: "Ongles",
                subcategories: [
                    { id: "nail-polish", label: "Vernis à Ongles Classiques" },
                    { id: "gel-polish", label: "Vernis Gel" },
                    { id: "semi-permanent", label: "Semi-permanent" },
                    { id: "base-coat", label: "Base Coat" },
                    { id: "top-coat", label: "Top Coat" },
                    { id: "nail-hardener", label: "Durcisseurs" },
                    { id: "matte-polish", label: "Vernis Mats" },
                    { id: "glitter-polish", label: "Vernis Pailletés & Effets" },
                    { id: "nail-remover", label: "Dissolvants" },
                    { id: "nail-stickers", label: "Stickers Ongles" },
                    { id: "nail-accessories", label: "Strass & Décorations" },
                ]
            },
            {
                id: "palettes-sets",
                label: "Palettes & Sets",
                subcategories: [
                    { id: "palette-face", label: "Palettes Teint Complètes" },
                    { id: "palette-contouring", label: "Palettes Contouring" },
                    { id: "palette-eyes", label: "Palettes Yeux" },
                    { id: "palette-lips", label: "Palettes Lèvres" },
                    { id: "palette-all-in-one", label: "Palettes Tout-en-un" },
                ]
            },
            {
                id: "specialises",
                label: "Maquillage Spécialisé",
                subcategories: [
                    { id: "body-makeup", label: "Maquillage Corporel" },
                    { id: "face-glitter", label: "Paillettes Visage & Corps" },
                    { id: "glitter", label: "Glitter" },
                    { id: "fx-makeup", label: "Maquillage Artistique / FX" },
                    { id: "temporary-tattoos", label: "Tatouages Temporaires" },
                    { id: "skin-jewels", label: "Bijoux de Peau" },
                ]
            },
        ],
    },
    {
        id: "parfum",
        label: "Parfums",
        subcategories: [
            { id: "women-perfume", label: "Parfums Femme" },
            { id: "women-toilette", label: "Eaux de Toilette Femme" },
            { id: "men-perfume", label: "Parfums Homme" },
            { id: "men-toilette", label: "Eaux de Toilette Homme" },
            {id: "unisex-perfume", label:"Parfums Unisex"},
            {id: "unisex-toilette", label:"Eaux de Toilette Unisex"},
            { id: "body-mist", label: "Brumes Parfumées" },
            // { id: "niche", label: "Parfumerie de Niche" },
            // { id: "exclusive", label: "Collections Exclusives" },
            { id: "sets", label: "Coffrets" },
        ],
    },
    // {
    //     id: "outils",
    //     label: "Accessoires",
    //     subcategories: [
    //         { id: "makeup-brush", label: "Pinceaux" },
    //         { id: "sponge", label: "Éponges Teint" },
    //         { id: "curler", label: "Recourbe-cils" },
    //         { id: "makeup-bag", label: "Trousses" },
    //         { id: "gua-sha", label: "Massage Visage" },
    //         { id: "face-brush", label: "Brosses Nettoyantes" },
    //         { id: "hair-brush", label: "Brosses & Peignes" },
    //         { id: "hair-device", label: "Appareils Coiffure" },
    //     ],
    // },
]
