import { Eyebrow, Headline, Section } from "../brand";

const TESTIMONIALS = [
    {
        quote:
            "I compared multiple platforms before investing, and Richharbor consistently offered the lowest pricing on unlisted shares. It gave me the confidence that I was getting the best value for my money.",
        name: "Amit S.",
        designation: "HNI Investor",
        title: "Lowest pricing",
    },
    {
        quote:
            "The team at Richharbor delivered my shares exactly on the committed date. Their focus on timely delivery makes them a trustworthy partner for serious investors like me.",
        name: "Priya K.",
        designation: "Private Banker",
        title: "Timely share delivery",
    },
    {
        quote:
            "From placing the order to final settlement, everything was smooth, transparent, and standardized. Richharbor has made unlisted share investing as simple as investing in listed stocks.",
        name: "Rahul M.",
        designation: "NRI Investor",
        title: "Smooth, standard process",
    },
    {
        quote:
            "What I loved most is how Richharbor helped me not just in buying but also in exiting at the right price. Their team guided me toward better deals and handled everything with complete professionalism.",
        name: "Neha A.",
        designation: "Wealth Manager",
        title: "Support to buy and sell",
    },
];

export function Testimonials2() {
    return (
        <Section className="space-y-12">
            <div className="max-w-3xl space-y-4">
                <Eyebrow>Testimonials</Eyebrow>
                <Headline className="text-4xl md:text-6xl">Trusted across the financial ecosystem.</Headline>
            </div>

            <div className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <div className="flex w-fit animate-scroll gap-4">
                    {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                        <figure key={i} className="flex w-[320px] shrink-0 flex-col justify-between rounded-3xl border border-rh-navy/10 bg-white/50 p-7 sm:w-95">
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-rh-gold">{t.title}</p>
                                <blockquote className="mt-4 text-[15px] leading-relaxed text-rh-navy/85">“{t.quote}”</blockquote>
                            </div>
                            <figcaption className="mt-8 border-t border-rh-navy/10 pt-5">
                                <p className="font-display text-2xl leading-none">{t.name}</p>
                                <p className="mt-1 text-sm text-rh-mute">{t.designation}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </Section>
    );
}
