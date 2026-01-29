"use client";

import type React from "react";
import { createContext, useContext } from "react";

interface SaintValentinProviderProps {
    
  children: React.ReactNode;
    saintValentin: boolean;

}

interface ContextType {
  saintValentin: boolean;
}

const SaintValentinContext = createContext<ContextType | undefined>(undefined);

export function SaintValentinProvider({ children, saintValentin }: SaintValentinProviderProps) {
  return (
    <SaintValentinContext.Provider value={{ saintValentin }}>
      {children}
    </SaintValentinContext.Provider>
  );
}
export function useSaintValentin() {
  const context = useContext(SaintValentinContext);

  if (!context) {
    throw new Error(
      "useSaintValentin must be used inside SaintValentinProvider"
    );
  }

  return context;
}