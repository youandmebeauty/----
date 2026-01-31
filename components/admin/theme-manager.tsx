"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useFeteTheme } from "@/components/coffret/fete-theme-provider"

const THEME_OPTIONS = [
  { key: "none", label: "Aucune" },
  { key: "saint-valentin", label: "Saint-Valentin" },
  { key: "fete-des-meres", label: "Fête des Mères" },
  { key: "fete-de-la-femme", label: "Fête de la Femme" },
  { key: "aid-el-fitr", label: "Aïd el-Fitr" },
  { key: "black-friday", label: "Black Friday" },
  { key: "rentree-scolaire", label: "Rentrée Scolaire" },
  { key: "fete-des-peres", label: "Fête des Pères" },
]

export default function ThemeManager() {
  const { themeKey, theme, setThemeKey } = useFeteTheme()
  const [selection, setSelection] = useState<string>(themeKey)
  const { toast } = useToast()

  const handleApply = () => {
    setThemeKey(selection as any)
    toast({ title: "Thème appliqué", description: `Thème ${selection} activé.` })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Gestionnaire de Thème (Fêtes)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <Label>Thème actif</Label>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="secondary">{theme.displayName}</Badge>
              <div className="text-sm text-muted-foreground">Clé: {themeKey}</div>
            </div>

            <div className="mt-4">
              <Label>Changer de thème</Label>
              <div className="mt-2 w-64">
                <Select value={selection} onValueChange={(v) => setSelection(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <Label>Aperçu</Label>
            <div className="mt-2 p-3 rounded-md border border-border/30 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                {(theme.icons || []).slice(0,3).map((ic, i) => (
                  <span key={i} style={{ fontSize: 20 }} aria-hidden>{ic}</span>
                ))}
              </div>
              <div className="h-8 w-full rounded-sm" style={{ background: theme.colors.primary }} />
              <div className="mt-2 text-sm">{theme.announcementText || "Aucun texte d'annonce"}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={handleApply} className="rounded-full">Appliquer</Button>
          <Button variant="outline" onClick={() => { setSelection("none"); setThemeKey("none") }} className="rounded-full">Désactiver</Button>
        </div>
      </CardContent>
    </Card>
  )
}
