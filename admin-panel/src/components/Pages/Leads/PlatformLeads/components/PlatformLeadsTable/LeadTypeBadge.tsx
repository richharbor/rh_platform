import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

type LeadTypeBadgeProps = {
  type: string;
};

type BadgeConfig = {
  label: string;
  className: string;
};

const STATIC_TYPE_MAP: Record<string, BadgeConfig> = {
  "request-callback": {
    label: "Request Callback",
    className: "bg-rfin-champagne/30 text-rfin-gold-deep border-rfin-champagne",
  },
  "contact-us": {
    label: "Contact Us",
    className: "bg-secondary text-foreground border-border",
  },
  "gen-ai-contact-us": {
    label: "Gen AI Contact Form",
    className: "bg-secondary text-foreground border-border",
  },
  "ai-for-product-leaders-contact-us": {
    label: "AI For Product Leaders Contact Form",
    className: "bg-secondary text-foreground border-border",
  },
};

function resolveBadge(type: string): BadgeConfig {
  if (!type) {
    return {
      label: "Unknown",
      className: "bg-secondary text-foreground border-border",
    };
  }
  
  if (type.includes("enrollment")) {
    return {
      label: "Enrollment Form",
      className: "bg-rfin-emerald/10 text-rfin-emerald border-rfin-emerald/25",
    };
  }

  if (type.includes("download")) {
    return {
      label: "Download Curriculum",
      className: "bg-rfin-navy/10 text-rfin-navy border-rfin-navy/20",
    };
  }

  return (
    STATIC_TYPE_MAP[type] || {
      label: type,
      className: "bg-secondary text-foreground border-border",
    }
  );
}

export default function LeadTypeBadge({ type }: LeadTypeBadgeProps) {
  const { label, className } = resolveBadge(type);

  return (
    <Badge
      variant="outline"
      className={clsx("font-medium", className)}
    >
      {label}
    </Badge>
  );
}
