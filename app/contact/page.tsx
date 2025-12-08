"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "✓ Message envoyé",
          description: data.message || "Nous vous répondrons dans les plus brefs délais.",
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        // Show specific error from API
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de l'envoi du message.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl m-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="container relative mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with hover effect */}
            <div className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group">
              <Mail className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">Service Client</span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-8 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Contactez-nous
            </h1>

            {/* Enhanced description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Une question sur nos produits ou besoin d'un conseil beauté personnalisé ?
              Notre équipe d'experts est à votre écoute.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {['Support 24/7', 'Réponse rapide', 'Experts beauté'].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-full border border-border/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <h2 className="font-serif text-2xl mb-8">Nos Coordonnées</h2>
              <div className="space-y-8">
                <div className="group">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Email</span>
                  </div>
                  <a href="mailto:contact@youandme.tn" className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                    contact@youandme.tn
                  </a>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <a href="tel:+21693220902" className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                    +216 93 220 902
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Lun-Ven: 9h-18h</p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">Boutique</span>
                  </div>
                  <address className="text-lg text-muted-foreground not-italic">
                    Route Lafrane KM 5.5, Markez Torki, Sfax Sud<br />
                    Sfax, Tunisie
                  </address>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-border/50">
              <h2 className="font-serif text-2xl mb-6">FAQ</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-border/50">
                  <AccordionTrigger className="text-base hover:no-underline py-4">
                    Livraison et retours
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Nous livrons partout en Tunisie sous 2 à 4 jours ouvrables. Les retours sont gratuits sous 7 jours si le produit n'a pas été ouvert.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b border-border/50">
                  <AccordionTrigger className="text-base hover:no-underline py-4">
                    Comment utiliser l'analyseur de peau IA ?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Notre analyseur de peau utilise l'intelligence artificielle pour détecter les problèmes de peau. Prenez simplement une photo de votre visage et recevez des recommandations personnalisées de produits adaptés à vos besoins.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b border-border/50">
                  <AccordionTrigger className="text-base hover:no-underline py-4">
                    Quels moyens de paiement acceptez-vous ?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Paiement à la livraison ou visitez-nous sur place dans notre boutique à Sfax. Nous acceptons espèces, carte bancaire et virement.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="bg-secondary/10 p-8 md:p-12 rounded-sm">
              <h2 className="font-serif text-3xl mb-8">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Nom Complet</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      className="bg-background border-border/50 focus:border-primary h-12 rounded-sm"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background border-border/50 focus:border-primary h-12 rounded-sm"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs uppercase tracking-wider text-muted-foreground">Sujet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    minLength={5}
                    className="bg-background border-border/50 focus:border-primary h-12 rounded-sm"
                    placeholder="Objet de votre message"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Message
                    <span className="text-muted-foreground/60 ml-2 text-xs normal-case">
                      ({formData.message.length}/10 caractères min)
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    minLength={10}
                    className="bg-background border-border/50 focus:border-primary resize-none rounded-sm p-4"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto h-12 px-8 bg-foreground text-background hover:bg-primary hover:text-white rounded-sm uppercase tracking-widest text-xs transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}