"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePref = "system" | "light" | "dark";

export const useThemePref = create<{ pref: ThemePref; setPref: (p: ThemePref) => void }>()(
  persist((set) => ({ pref: "system", setPref: (pref) => set({ pref }) }), { name: "rfin.theme", storage: createJSONStorage(() => localStorage) }),
);
