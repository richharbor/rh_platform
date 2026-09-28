import type { Paise } from "./models";

/** Indian digit grouping: 12,34,567 */
export const formatIN = (n: number) => {
  const [int, dec] = Math.abs(n).toFixed(0).split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (n < 0 ? "-" : "") + (rest ? rest + "," + last3 : last3) + (dec ? "." + dec : "");
};

export const formatINR = (paise: Paise) => "₹" + formatIN(Math.round(paise / 100));

export const formatCompact = (paise: Paise) => {
  const r = paise / 100;
  if (r >= 1e7) return `₹${(r / 1e7).toFixed(r >= 1e8 ? 0 : 1)} Cr`;
  if (r >= 1e5) return `₹${(r / 1e5).toFixed(r >= 1e6 ? 0 : 1)} L`;
  if (r >= 1e3) return `₹${(r / 1e3).toFixed(1)}K`;
  return formatINR(paise);
};
