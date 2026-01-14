import Cookies from "js-cookie";

/**
 * Returns a proper tier-aware path prefix (without leading slash)
 * Example: "b/rhinon-tech/franchise-admin"
 */
export const getTieredPath = (): string => {
  const tier = Number(Cookies.get("tier"));
  const role = (Cookies.get("currentRole") || "").toLowerCase();
  const franchise = (Cookies.get("franchiseName") || "").toLowerCase();

  if (tier === 1 || tier === 2) {
    return `a/${role}`;
  } else if (tier === 3) {
    return `b/${franchise}/superadmin`;
  } else if (tier === 4) {
    return `b/${franchise}/${role}`;
  } else {
    return `a/${role}`; // fallback
  }
};
