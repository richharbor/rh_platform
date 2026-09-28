"use client";
import { useRouter } from "next/navigation";
import { track } from "@/lib/api";
import { Button, PageTitle, TrustBanner } from "@/components/ui";

/** Entry: say what RFIN does before asking for anything (report #11). */
export default function Welcome() {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Welcome"
        title="Start with what matters."
        lede="Invest, protect your family, borrow, sell private shares or refer someone — with every application and reward tracked in one place."
      />
      <div className="rfin-rise rfin-delay-2 space-y-3">
        <Button
          block
          onClick={() => {
            track("signup_started");
            router.push("/phone");
          }}
        >
          Get started <span aria-hidden>↗</span>
        </Button>
        <p className="text-center text-xs text-rfin-mute">Already with RFIN? Use the same number to sign in.</p>
      </div>
      <div className="rfin-rise rfin-delay-3">
        <TrustBanner>Your RFIN ID works for buying, selling and referring — no separate accounts.</TrustBanner>
      </div>
    </div>
  );
}
