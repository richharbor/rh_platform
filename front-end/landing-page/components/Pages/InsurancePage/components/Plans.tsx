import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Essential",
    price: "$29",
    period: "/month",
    description: "Basic coverage for individuals starting out",
    features: [
      "Basic life insurance up to $100K",
      "Standard health coverage",
      "24/7 phone support",
      "Online claims filing",
    ],
    popular: false,
  },
  {
    name: "Family",
    price: "$79",
    period: "/month",
    description: "Comprehensive coverage for your whole family",
    features: [
      "Life insurance up to $500K",
      "Full health coverage",
      "Home & auto bundled discounts",
      "Priority customer support",
      "Annual policy review",
      "No deductible options",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "$149",
    period: "/month",
    description: "Maximum protection with exclusive benefits",
    features: [
      "Life insurance up to $2M",
      "Premium health with dental & vision",
      "Full home & auto coverage",
      "Dedicated account manager",
      "Umbrella liability protection",
      "Investment advisory services",
    ],
    popular: false,
  },
]

export function Plans() {
  return (
    <section id="plans" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl text-balance">
            Choose Your Coverage Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible plans designed to fit your budget and protection needs.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.popular ? "border-[#4AA651] bg-card shadow-lg scale-105" : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#4AA651] px-4 py-1 text-xs font-semibold text-accent-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full ${
                  plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                variant={plan.popular ? "default" : "secondary"}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
