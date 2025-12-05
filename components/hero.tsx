"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {

    return (
        <div className="relative overflow-hidden flex items-center min-h-[600px] rounded-3xl m-4 ">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5 rounded-3xl" />

            <div className="container relative z-20 mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Text content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 mb-8">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="text-sm font-medium tracking-widest uppercase text-primary">Premium Beauty Collection</span>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
                            Beauté <span className="text-primary">Naturelle</span>
                            <br />
                            Élégance Intemporelle
                        </h1>

                        <p className="mb-8 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-lg">
                            Découvrez notre gamme exclusive de soins pour la peau, conçue pour révéler votre éclat naturel avec des ingrédients purs et efficaces.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Link href="/shop">
                                <Button size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 h-14 px-8 text-lg">
                                    Découvrir la Collection
                                </Button>
                            </Link>
                            <Link href="/skin-analyzer">
                                <Button size="lg" variant="outline" className="rounded-xl border-2 h-14 px-8 text-lg hover:bg-secondary/50">
                                    Analyseur de Peau
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right side - 3D Model */}
                    {/* Right side - 3D Model */}

                </div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>
        
    )
}
