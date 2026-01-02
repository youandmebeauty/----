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
import { Breadcrumb } from "@/components/breadcrumb"
import { ScrollAnimation } from "@/components/scroll-animation"
// export const metadata: Metadata = {


//     title: "Contactez-Nous",
//     description: "Contactez notre équipe d'experts pour toute question sur nos produits ou pour des conseils beauté personnalisés.",
//     alternates: {
//       canonical:`https://youandme.tn/contact`,
//     },    openGraph: {
//       title: "Contactez-Nous",
//       description: "Contactez notre équipe d'experts pour toute question sur nos produits ou pour des conseils beauté personnalisés.",
//     },
//     keywords: [
//       'contact',
//       'service client',
//       'support',
//       'conseils beauté',
//       'cosmétique',
//       'beauté',
//       'Tunisie'
//     ],
//     robots: {
//       index: true,
//       follow: true,
//       googleBot: {
//         index: true,
//         follow: true,
//         'max-image-preview': 'large',
//         'max-snippet': -1,
//       },
//     },
//   } 
export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "name": "Contactez You & Me Beauty",
        "description": "Contactez notre équipe d'experts pour toute question sur nos produits ou pour des conseils beauté personnalisés.",
        "url": "https://youandme.tn/contact",
        "mainEntity": {
          "@type": "BeautySalon",
          "name": "You & Me Beauty",
          "image": "https://youandme.tn/logo.webp",
          "telephone": "+216 93 220 902",
          "email": "youandme282@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Route Lafrane KM 5.5, Markez Torki, Sfax Sud",
            "addressLocality": "Sfax",
            "addressCountry": "TN"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "09:00",
            "closes": "19:00"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://youandme.tn"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Contact",
            "item": "https://youandme.tn/contact"
          }
        ]
      }
    ]
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl m-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <ScrollAnimation
          variant="blurRise"
          duration={0.9}
          ease="power4.out"
          className="container relative mx-auto px-4 py-20 lg:py-28"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <ScrollAnimation
              variant="flipUp"
              perspective={1400}
              ease="expo.out"
              className="flex justify-start mb-8"
            >
              <Breadcrumb
                items={[{ name: "Contact", href: "/contact", current: true }]}
              />
            </ScrollAnimation>

            {/* Badge with hover effect */}
            <ScrollAnimation
              variant="scaleUp"
              delay={0.08}
              className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group"
            >
              <Mail className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Service Client</span>
            </ScrollAnimation>

            {/* Main heading with gradient */}
            <ScrollAnimation
              variant="blurRise"
              delay={0.1}
              className="mb-8"
            >
              <h1 className="font-serif text-5xl font-medium tracking-tight text-transparent md:text-6xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                Contactez-nous
              </h1>
            </ScrollAnimation>

            {/* Enhanced description */}
            <ScrollAnimation variant="slideUp" delay={0.12} className="mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed md:text-xl max-w-2xl mx-auto">
                Une question sur nos produits ou besoin d'un conseil beauté personnalisé ?
                Notre équipe d'experts est à votre écoute.
              </p>
            </ScrollAnimation>

            {/* Feature highlights */}
            <ScrollAnimation
              variant="rotateSkew"
              stagger={0.12}
              childSelector=".contact-feature"
              className="flex flex-wrap justify-center gap-4 text-sm"
            >
              {['Support 24/7', 'Réponse rapide', 'Experts beauté'].map((feature, index) => (
                <div
                  key={index}
                  className="contact-feature flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-2 backdrop-blur-sm"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </ScrollAnimation>
          </div>
        </ScrollAnimation>
      </div>

      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Contact Info */}
          <ScrollAnimation
            variant="slideUp"
            start="top 85%"
            end="bottom center"
            className="lg:col-span-4 space-y-10"
          >
            <div>
              <h2 className="font-serif text-2xl mb-6">Nos Coordonnées</h2>
              <ScrollAnimation
                variant="flipUp"
                perspective={1200}
                stagger={0.18}
                childSelector=".contact-info-item"
                className="space-y-8"
              >
                <div className="contact-info-item group">
                  <div className="mb-2 flex items-center gap-3 text-primary">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Email</span>
                  </div>
                  <a href="mailto:youandme282@gmail.com" className="text-lg text-muted-foreground transition-colors hover:text-foreground">
                    youandme282@gmail.com
                  </a>
                </div>

                <div className="contact-info-item group">
                  <div className="mb-2 flex items-center gap-3 text-primary">
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <a href="tel:+21693220902" className="text-lg text-muted-foreground transition-colors hover:text-foreground">
                    +216 93 220 902
                  </a>
                  <p className="mt-1 text-sm text-muted-foreground">Lun-Sam: 9h-19h</p>
                  <p className="text-sm text-muted-foreground">Dim: 10h-16h</p>
                </div>

                <div className="contact-info-item group">
                  <div className="mb-2 flex items-center gap-3 text-primary">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">Boutique</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-background">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d652.1485706667269!2d10.71399738873673!3d34.77518241403843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1301d389d33a9e57%3A0x66ebe5d74f8e7e90!2sYou%20%26%20Me%20Beauty!5e1!3m2!1sen!2stn!4v1766356491605!5m2!1sen!2stn"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <address className="mt-2 text-xs text-muted-foreground">
                    Route Lafrane KM 5.5, Markez Torki, Sfax, Tunisie
                  </address>
                </div>
              </ScrollAnimation>
            </div>
          </ScrollAnimation>

          {/* Contact Form */}
          <ScrollAnimation
            variant="flipUp"
            perspective={1400}
            ease="expo.out"
            className="lg:col-span-7 lg:col-start-6"
          >
            <div className="rounded-2xl border border-border/40 bg-background p-8 shadow-sm md:p-10">
              <h2 className="font-serif text-3xl mb-8">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Nom Complet</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      className="h-12 rounded-sm border-border/50 bg-background focus:border-primary"
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
                      className="h-12 rounded-sm border-border/50 bg-background focus:border-primary"
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
                    className="h-12 rounded-sm border-border/50 bg-background focus:border-primary"
                    placeholder="Objet de votre message"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Message
                    <span className="ml-2 text-xs normal-case text-muted-foreground/60">
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
                    className="resize-none rounded-sm border-border/50 bg-background p-4 focus:border-primary"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-sm bg-foreground px-8 text-xs uppercase tracking-widest text-background transition-all duration-300 hover:bg-primary hover:text-white md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </div>
          </ScrollAnimation>

        </div>

        <section className="mt-16 border-t border-border/40 pt-10">
          <ScrollAnimation variant="blurRise" className="max-w-3xl space-y-4">
            <h2 className="font-serif text-2xl">FAQ</h2>
            <ScrollAnimation
              variant="slideUp"
              stagger={0.1}
              childSelector=".faq-item"
              className="w-full"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="faq-item border-b border-border/50">
                  <AccordionTrigger className="py-4 text-base hover:no-underline">
                    Livraison
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    Nous livrons partout en Tunisie sous 2 à 4 jours ouvrables.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1b" className="faq-item border-b border-border/50">
                  <AccordionTrigger className="py-4 text-base hover:no-underline">
                    Authenticité Garantie
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    Nous garantissons que chaque produit est authentique, vérifié et issu de circuits officiels pour assurer une qualité irréprochable.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="faq-item border-b border-border/50">
                  <AccordionTrigger className="py-4 text-base hover:no-underline">
                    Comment utiliser l'analyseur de peau IA ?
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    Notre analyseur de peau utilise l'intelligence artificielle pour détecter les problèmes de peau. Prenez simplement une photo de votre visage et recevez des recommandations personnalisées de produits adaptés à vos besoins.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="faq-item border-b border-border/50">
                  <AccordionTrigger className="py-4 text-base hover:no-underline">
                    Quels moyens de paiement acceptez-vous ?
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    Paiement à la livraison ou visitez-nous sur place dans notre boutique à Sfax. Nous acceptons espèces, carte bancaire et virement.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollAnimation>
          </ScrollAnimation>
        </section>
      </main>
    </div>
  )
}