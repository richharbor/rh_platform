"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Half-finished applications, keyed by product — resumable (report #13). */
export type Draft = { step: number; amount: number; consents: boolean[]; payMethod?: string; updatedAt: string };

type State = {
  drafts: Record<string, Draft>;
  save: (productId: string, patch: Partial<Draft>) => void;
  clear: (productId: string) => void;
};

export const useDrafts = create<State>()(
  persist(
    (set) => ({
      drafts: {},
      save: (id, patch) =>
        set((s) => ({
          drafts: { ...s.drafts, [id]: { ...(s.drafts[id] ?? { step: 0, amount: 0, consents: [] }), ...patch, updatedAt: new Date().toISOString() } },
        })),
      clear: (id) =>
        set((s) => {
          const { [id]: _gone, ...rest } = s.drafts;
          return { drafts: rest };
        }),
    }),
    { name: "rfin.drafts", storage: createJSONStorage(() => localStorage) },
  ),
);
