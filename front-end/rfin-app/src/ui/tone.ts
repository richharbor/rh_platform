import type { Tone } from "@/domain/states";
import type { Theme } from "@/design";

/**
 * Status tone → colour. The reference colours status by meaning:
 * APPROVED green · IN REVIEW amber · DOCS DUE blue; red is reserved for the
 * thing that needs you now.
 */
export function toneColors({ colors: c }: Theme, tone: Tone) {
  switch (tone) {
    case "success":
      return { solid: c.green, soft: c.greenSoft, text: c.green };
    case "pending":
      return { solid: c.amber, soft: c.amberSoft, text: c.amber };
    case "info":
      return { solid: c.blue, soft: c.blueSoft, text: c.blue };
    case "action":
      return { solid: c.red, soft: c.redSoft, text: c.red };
    case "danger":
      return { solid: c.destructive, soft: c.redSoft, text: c.destructive };
    default:
      return { solid: c.mute, soft: c.pressed, text: c.mute };
  }
}
