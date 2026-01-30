"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Gift, Tag, Cloud, CloudRain, Sun, Wind, MapPin } from "lucide-react"
import type React from "react"
import { LoadingAnimation } from "../ui/loading-animation"

interface WeatherData {
  current: {
    time: string
    temperature_2m: number
    wind_speed_10m: number
  }
}

interface LocationData {
  latitude: number
  longitude: number
  city?: string
}

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname() || ""
  const [open, setOpen] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(false)

  const items: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/orders", label: "Commandes", icon: <ShoppingCart className="w-5 h-5" /> },
    { href: "/admin/products", label: "Produits", icon: <Package className="w-5 h-5" /> },
    { href: "/admin/coffrets", label: "Coffrets", icon: <Gift className="w-5 h-5" /> },
    { href: "/admin/promos", label: "Codes Promo", icon: <Tag className="w-5 h-5" /> },
  ]

  // Hide sidebar on the admin login page
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return null

  // Get user's location
  useEffect(() => {
    const getLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Try to get city name using reverse geocoding
            try {
              const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
              )
              const geoData = await geoResponse.json()
              
              setLocation({
                latitude,
                longitude,
                city: geoData.city || geoData.locality || "Votre ville"
              })
            } catch {
              setLocation({ latitude, longitude, city: "Votre ville" })
            }
            
            setLocationError(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            // Fallback to default location (Sfax)
            setLocation({
              latitude: 34.7398,
              longitude: 10.7600,
              city: "Sfax"
            })
            setLocationError(true)
          }
        )
      } else {
        // Geolocation not supported, use default
        setLocation({
          latitude: 34.7398,
          longitude: 10.7600,
          city: "Sfax"
        })
        setLocationError(true)
      }
    }

    getLocation()
  }, [])

  // Fetch weather data based on location
  useEffect(() => {
    if (!location) return

    const fetchWeather = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m`
        )
        const data = await response.json()
        setWeather(data)
      } catch (error) {
        console.error("Error fetching weather:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location])

  // Get time-based greeting
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()
      
      if (hour >= 5 && hour < 12) {
        return "Bonjour"
      } else if (hour >= 12 && hour < 18) {
        return "Bon après-midi"
      } else if (hour >= 18 && hour < 22) {
        return "Bonsoir"
      } else {
        return "Bonne nuit"
      }
    }

    setGreeting(getGreeting())
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Show sidebar by default on md+ screens, hide on small screens
    const mq = window.matchMedia("(min-width: 768px)")
    const apply = () => setOpen(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  // Close sidebar when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Get weather icon based on temperature and wind
  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-4 h-4" />
    
    const temp = weather.current.temperature_2m
    const wind = weather.current.wind_speed_10m
    
    if (wind > 20) return <Wind className="w-4 h-4" />
    if (temp > 25) return <Sun className="w-4 h-4" />
    if (temp < 10) return <CloudRain className="w-4 h-4" />
    return <Cloud className="w-4 h-4" />
  }

  const renderNavContent = () => (
    <nav className="h-full w-full flex flex-col pt-8 px-4">
      <div className="mb-12 text-center">
        <h2 className="  text-3xl text-primary mb-1 tracking-tight">
          {greeting}
        </h2>
        <h3 className="text-xl font-medium text-primary/80">Oumaima!</h3>
        <div className="h-1 w-16 bg-primary/20 mx-auto rounded-full mt-3" />
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl text-lg
                  transition-all duration-200 ease-out
                  ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "hover:bg-primary/5 hover:translate-x-1"
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pb-6 pt-4 border-t border-border/50">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
           <LoadingAnimation ></LoadingAnimation>
          </div>
        ) : weather && location ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              {getWeatherIcon()}
              <p className="text-2xl font-semibold">
                {Math.round(weather.current.temperature_2m)}°C
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                <span>{Math.round(weather.current.wind_speed_10m)} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{location.city}</span>
              </div>
            </div>
            {locationError && (
              <p className="text-[10px] text-muted-foreground/70 text-center mt-1">
                Position par défaut
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Météo indisponible
          </p>
        )}
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="
          fixed top-4 left-4 z-50 p-2.5 rounded-xl
          bg-background 
          border border-border/50 shadow-lg
          transition-all duration-200 hover:scale-105 active:scale-95
          md:hidden
        "
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:block m-4 sticky z-40 top-4
          bg-background/95 backdrop-blur-sm w-64 h-[calc(100vh-2rem)]
          rounded-2xl border border-border/50 shadow-xl
          transition-all duration-300 hover:shadow-2xl
          ${className}
        `}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile drawer with backdrop */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
            <div
              className="
                absolute left-0 top-0 bottom-0 w-full
                bg-background 
                border-r border-border/50 shadow-2xl
                pointer-events-auto
                animate-in slide-in-from-left duration-300
              "
            >
              {renderNavContent()}
            </div>
          </div>
        </>
      )}
    </>
  )
}