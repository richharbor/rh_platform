import type { Need } from "./models";
/** The reference's four accents. */
export type Accent = "red" | "blue" | "amber" | "green";

/** The eight needs from report #4. */
export const NEEDS: { id: Need; label: string }[] = [
  { id: "grow_wealth", label: "Grow wealth" },
  { id: "protect_family", label: "Protect family" },
  { id: "need_funding", label: "Need funding" },
  { id: "invest_surplus", label: "Invest surplus" },
  { id: "sell_asset", label: "Sell an asset" },
  { id: "save_plan", label: "Save & plan" },
  { id: "find_opportunity", label: "Find opportunity" },
  { id: "refer_someone", label: "Refer a friend" },
];

/**
 * The reference's four accents always run red → blue → amber → green by
 * position, so any set of tiles reads as one system, whatever was picked.
 */
const ACCENT_ORDER: Accent[] = ["red", "blue", "amber", "green"];
export const accentAt = (i: number) => ACCENT_ORDER[i % ACCENT_ORDER.length];

export const needLabel = (n: Need) => NEEDS.find((x) => x.id === n)?.label ?? n;
