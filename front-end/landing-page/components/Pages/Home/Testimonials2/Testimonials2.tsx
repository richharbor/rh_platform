
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export function Testimonials2() {
    const testimonials = [
        {
            quote:
                "I compared multiple platforms before investing, and Richharbor consistently offered the lowest pricing on unlisted shares. It gave me the confidence that I was getting the best value for my money.",
            name: "Amit S.",
            designation: "HNI Investor",
            title: 'Lowest Pricing',
            src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "The team at Richharbor delivered my shares exactly on the committed date. Their focus on timely delivery makes them a trustworthy partner for serious investors like me.",
            name: "Priya K.",
            designation: "Private Banker",
            title: "Timely Share Delivery",
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "From placing the order to final settlement, everything was smooth, transparent, and standardized. Richharbor has made unlisted share investing as simple as investing in listed stocks.",
            name: "Rahul M.",
            title: "Smooth & Standard Process",
            designation: "NRI Investor",
            src: "https://i.pinimg.com/736x/76/53/16/765316b12b380d310f0aa4c35b80eb4c.jpg",
        },
        {
            quote:
                "What I loved most is how Richharbor helped me not just in buying but also in exiting at the right price. Their team guided me toward better deals and handled everything with complete professionalism.",
            name: "Neha A.",
            designation: "Wealth Manager",
            title: "Assisting in Better Deals & Dual Support (Buy + Sell)",
            src: "https://i.pinimg.com/1200x/1a/00/af/1a00afa29ff7553edd5dae2a5450ebba.jpg",
        },
    ];
    return (
        <div className="flex rounded-2x flex-col gap-10 max-md:gap-2 h-full mx-auto w-full max-sm:w-[90vw] lg:max-w-[1500px] overflow-hidden px-2 lg:px-10 py-10 max-md:py-10">
            {/* <h2 className="text-3xl font-batman mx-20 max-sm:mx-5 md:text-4xl text-center lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">Testimonials</h2> */}
            <div className="text-center">
                    <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3 ">Testimonials</h2>
                    <h3 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-foreground mb-4 ">
                        Trusted by Professionals Across the Financial Ecosystem
                    </h3>
                </div>

            <div className="relative mt-5 max-w-[100vw] [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] overflow-hidden ">
                <div className="flex w-fit gap-[16px] animate-scroll">
                    {[...testimonials, ...testimonials].map((t, idx) => (
                        <Card key={idx} className="hover:shadow-md w-sm max-sm:w-[300px] transition-shadow duration-200 ease-in-out">
                            <CardHeader className="flex items-center gap-4">
                                {/* <Avatar>
                                    <AvatarImage src={t.src} alt={t.name} />
                                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                                </Avatar> */}
                                <div>
                                    <CardTitle className="text-2xl font-bold">{t.name}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {t.designation}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold text-primary mb-2">{t.title}</p>
                                <blockquote className="text-sm text-foreground/90 italic">“{t.quote}”</blockquote>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

