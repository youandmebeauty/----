"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  FaHeart,
  FaCrown,
  FaMoon,
  FaGift,
  FaFire,
  FaBolt,
  FaBook,
  FaBriefcase,
  FaUser,
  FaUsers,
  FaStar,
} from "react-icons/fa6";
import {IoFlower} from "react-icons/io5";
import { FaSmileBeam } from "react-icons/fa";
import {HiSparkles} from "react-icons/hi";
import type { IconType } from "react-icons";

type FeteKey =
  | "none"
  | "saint-valentin"
  | "fete-des-meres"
  | "fete-de-la-femme"
  | "aid-el-fitr"
  | "black-friday"
  | "rentree-scolaire"
  | "fete-des-peres";

interface FeteTheme {
  key: FeteKey;
  displayName: string;
  icons: IconType[];
  colors: {
    primary: string;
    secondary?: string;
    text?: string;
    bg?: string;
  };
  announcementText: string;
}

const FESTIVAL_THEMES: Record<FeteKey, FeteTheme> = {
  none: {
    key: "none",
    displayName: "None",
    icons: [],
    colors: { primary: "#000000", bg: "#ffffff" },
    announcementText: "",
  },
  "saint-valentin": {
    key: "saint-valentin",
    displayName: "Saint-Valentin",
    icons: [FaHeart, HiSparkles, IoFlower],
    colors: { primary: "#FF0055", secondary: "#FF66AA", text: "#ffffff", bg: "#FFF5F7" },
    announcementText: "Profitez avec You & Me Beauty des offres exclusives pour la Saint-Valentin",
  },
  "fete-des-meres": {
    key: "fete-des-meres",
    displayName: "Fête des Mères",
    icons: [IoFlower, FaUsers, FaHeart],
    colors: { primary: "#F6D1D8", secondary: "#F0E6D2", text: "#6B4F3E", bg: "#FFF9F7" },
    announcementText: "Dites merci à maman avec You & Me Beauty : offres spéciales Fête des Mères",
  },
  "fete-de-la-femme": {
    key: "fete-de-la-femme",
    displayName: "Fête de la Femme",
    icons: [IoFlower, FaCrown, HiSparkles],
    colors: { primary: "#7B61FF", secondary: "#FF33AA", text: "#FFD700", bg: "#FBF7FF" },
    announcementText: "Célébrez la femme avec You & Me Beauty : des offres qui vous ressemblent",
  },
  "aid-el-fitr": {
    key: "aid-el-fitr",
    displayName: "Aïd el-Fitr",
    icons: [FaMoon, HiSparkles, FaGift],
    colors: { primary: "#0B7A57", secondary: "#D4AF37", text: "#ffffff", bg: "#F8FFF7" },
    announcementText: "Aïd Mabrouk – Profitez avec You & Me Beauty d'offres spéciales Aïd el-Fitr",
  },
  "black-friday": {
    key: "black-friday",
    displayName: "Black Friday",
    icons: [FaStar, FaFire, FaBolt],
    colors: { primary: "#000000", secondary: "#333333", text: "#FF0000", bg: "#0F0F0F" },
    announcementText: "Black Friday chez You & Me Beauty – Des prix irrésistibles pendant une durée limitée !",
  },
  "rentree-scolaire": {
    key: "rentree-scolaire",
    displayName: "Rentrée Scolaire",
    icons: [FaBriefcase, FaBook, FaSmileBeam],
    colors: { primary: "#0077CC", secondary: "#88E0A8", text: "#ffffff", bg: "#F7FBFF" },
    announcementText: "Nouvelle rentrée, nouvelle routine – Offres spéciales rentrée chez You & Me Beauty",
  },
  "fete-des-peres": {
    key: "fete-des-peres",
    displayName: "Fête des Pères",
    icons: [FaBriefcase, FaUser, FaGift],
    colors: { primary: "#0A2540", secondary: "#6B7280", text: "#ffffff", bg: "#F7F9FB" },
    announcementText: "Faites plaisir à papa avec You & Me Beauty – Offres spéciales Fête des Pères",
  },
};

interface FeteContextValue {
  themeKey: FeteKey;
  theme: FeteTheme;
  setThemeKey: (k: FeteKey) => void;
}

const FeteContext = createContext<FeteContextValue | undefined>(undefined);

export function FeteThemeProvider({ children, initialTheme = "none" }: { children: React.ReactNode; initialTheme?: FeteKey }) {
  const [themeKey, setThemeKey] = useState<FeteKey>(initialTheme);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/theme");
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        const serverKey = json?.key as FeteKey | undefined;
        if (!cancelled && serverKey && serverKey in FESTIVAL_THEMES) {
          setThemeKey(serverKey);
          try { localStorage.setItem("feteTheme", serverKey); } catch (e) {}
          return;
        }
      } catch (e) {}

      try {
        const stored = localStorage.getItem("feteTheme") as FeteKey | null;
        if (stored && stored in FESTIVAL_THEMES) setThemeKey(stored);
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, []);

  const updateThemeKey = async (k: FeteKey) => {
    setThemeKey(k);
    try { localStorage.setItem("feteTheme", k); } catch (e) {}
    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
    } catch (e) {
      console.error("Failed to persist fête theme to server", e);
    }
  };

  const value = useMemo(() => ({ themeKey, theme: FESTIVAL_THEMES[themeKey], setThemeKey: updateThemeKey }), [themeKey]);

  return <FeteContext.Provider value={value}>{children}</FeteContext.Provider>;
}

export function useFeteTheme() {
  const ctx = useContext(FeteContext);
  if (!ctx) throw new Error("useFeteTheme must be used inside FeteThemeProvider");
  return ctx;
}