"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Code2,
    Server,
    Database,
    Cloud,
    Boxes,
    Rocket,
    CheckCircle2,
    Sparkles,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Phone,
    MessageCircle,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";

export default function TechSupport() {
    const { open: openQueryWidget } = useQueryWidgetStore();
    const [showContactDialog, setShowContactDialog] = React.useState(false);

    const techStack = [
        {
            category: "Frontend",
            icon: Code2,
            technologies: ["React.js", "Next.js", "Angular.js", "Vue.js", "TypeScript"],
            color: "text-rh-navy bg-rh-navy/10",
            borderColor: "border-rh-navy/20"
        },
        {
            category: "Backend",
            icon: Server,
            technologies: ["Node.js", "FastAPI (Python)", "Express.js", "Django", "NestJS"],
            color: "text-rh-emerald bg-rh-emerald/10",
            borderColor: "border-rh-emerald/20"
        },
        {
            category: "Mobile Development",
            icon: Sparkles,
            technologies: ["React Native", "Flutter", "iOS (Swift)", "Android (Kotlin)"],
            color: "text-rh-gold bg-rh-gold/10",
            borderColor: "border-rh-gold/20"
        },
        {
            category: "Database",
            icon: Database,
            technologies: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch"],
            color: "text-rh-navy bg-rh-navy/10",
            borderColor: "border-rh-navy/20"
        },
        {
            category: "Cloud",
            icon: Cloud,
            technologies: ["AWS", "GCP", "Azure", "DigitalOcean", "Vercel"],
            color: "text-rh-gold bg-rh-gold/10",
            borderColor: "border-rh-gold/20"
        },
        {
            category: "DevOps & CI/CD",
            icon: Boxes,
            technologies: ["Jenkins", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
            color: "text-rh-navy bg-rh-navy/10",
            borderColor: "border-rh-navy/20"
        },
        {
            category: "Testing & QA",
            icon: Shield,
            technologies: ["Jest", "Cypress", "Playwright", "Selenium", "Postman"],
            color: "text-rh-gold bg-rh-gold/10",
            borderColor: "border-rh-gold/20"
        },
        {
            category: "Message Queues",
            icon: Zap,
            technologies: ["RabbitMQ", "Kafka", "Redis Pub/Sub", "AWS SQS", "WebSockets"],
            color: "text-red-500 bg-red-500/10",
            borderColor: "border-red-500/20"
        },
        {
            category: "Monitoring & Analytics",
            icon: TrendingUp,
            technologies: ["Grafana", "Prometheus", "Datadog", "New Relic", "Sentry"],
            color: "text-rh-navy bg-rh-navy/10",
            borderColor: "border-rh-navy/20"
        },
        {
            category: "Version Control",
            icon: Code2,
            technologies: ["Git", "GitHub", "GitLab", "Bitbucket"],
            color: "text-rh-emerald bg-rh-emerald/10",
            borderColor: "border-rh-emerald/20"
        },
        {
            category: "API Technologies",
            icon: Server,
            technologies: ["REST", "GraphQL", "gRPC", "WebSockets", "Webhooks"],
            color: "text-rh-emerald bg-rh-emerald/10",
            borderColor: "border-rh-emerald/20"
        }
    ];

    const services = [
        {
            title: "Full-Stack Development",
            description: "Custom web and mobile applications built with modern frameworks and best practices.",
            icon: Code2
        },
        {
            title: "API Development & Integration",
            description: "RESTful and GraphQL APIs with seamless third-party integrations.",
            icon: Server
        },
        {
            title: "Cloud Infrastructure",
            description: "Scalable cloud architecture on AWS and GCP with optimal resource management.",
            icon: Cloud
        },
        {
            title: "DevOps & CI/CD",
            description: "Automated deployment pipelines, containerization, and continuous delivery.",
            icon: Rocket
        },
        {
            title: "Database Architecture",
            description: "Robust database design, optimization, and migration services.",
            icon: Database
        },
        {
            title: "Maintenance & Support",
            description: "24/7 monitoring, updates, and technical support for your applications.",
            icon: Shield
        }
    ];

    const clientSegments = [
        {
            title: "Startups",
            description: "MVP development, rapid prototyping, and scalable architecture to bring your vision to life.",
            icon: Sparkles,
            features: ["Fast turnaround", "Cost-effective solutions", "Scalable foundation"]
        },
        {
            title: "Growing Companies",
            description: "System optimization, feature expansion, and infrastructure scaling as you grow.",
            icon: TrendingUp,
            features: ["Performance optimization", "Feature development", "Infrastructure scaling"]
        },
        {
            title: "Mid-Level Enterprises",
            description: "Complex integrations, legacy modernization, and enterprise-grade solutions.",
            icon: Users,
            features: ["Enterprise integrations", "Legacy modernization", "Custom solutions"]
        }
    ];

    const whyChooseUs = [
        "Expert team across multiple technology stacks",
        "End-to-end ownership from concept to deployment",
        "Agile development with continuous feedback",
        "Industry best practices and security standards",
        "Scalable solutions designed for growth",
        "Dedicated support and maintenance"
    ];

    return (
        <div className="flex flex-col pt-5 sm:pt-20">

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full pt-5 overflow-hidden">
                    <div className="container px-2 md:px-6 relative mx-auto">
                        <div className="text-center max-w-5xl mx-auto pt-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8"
                            >
                                <Zap className="w-4 h-4 text-rh-gold fill-yellow-500" />
                                Enterprise Technology Solutions
                            </motion.div>

                            <h1 className="text-2xl font-batman sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                End-to-End Tech Support for Enterprises
                            </h1>

                            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                From startups to mid-level enterprises - we provide comprehensive technology support.
                                Development, deployment, and everything in between. One team, full stack.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-16">
                                <Button
                                    size="lg"
                                    className="rounded-full md:text-[16px] font-semibold h-12 px-8"
                                    onClick={() => setShowContactDialog(true)}
                                >
                                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('tech-stack')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="rounded-full md:text-[16px] font-semibold h-12 px-8 bg-transparent border-border hover:bg-foreground/5 text-foreground backdrop-blur-sm"
                                >
                                    View Our Stack
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Showcase */}
                <section id="tech-stack" className="py-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4 text-foreground">
                                Our Technology Stack
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Expertise across the entire technology spectrum - from frontend to cloud infrastructure.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {techStack.map((stack, index) => (
                                <motion.div
                                    key={stack.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border ${stack.borderColor} hover:border-primary/50`}
                                >
                                    <div className={`w-14 h-14 rounded-xl ${stack.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-border`}>
                                        <stack.icon className="w-7 h-7 stroke-[1.5]" />
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-4 font-batman tracking-tight">
                                        {stack.category}
                                    </h3>

                                    <div className="space-y-2">
                                        {stack.technologies.map((tech, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                <span className="text-foreground/80 text-sm">{tech}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-muted-foreground text-lg">
                                <span className="text-foreground font-semibold">...and much more.</span> From development to deployment, we handle it all.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-24 bg-secondary/20 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4 text-foreground">
                                Comprehensive Services
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Full-cycle development services tailored to your business needs.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-background rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 border border-border">
                                        <service.icon className="w-6 h-6 stroke-[1.5]" />
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-3 font-batman">
                                        {service.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rh-navy/5 via-transparent to-transparent pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        {/* Left Content */}
                        <div>
                            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Why Choose Us</h2>
                            <h3 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-foreground mb-8">
                                Your Trusted <span className="text-primary">Technology Partner</span>
                            </h3>

                            <div className="space-y-6">
                                {whyChooseUs.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-4 group">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/50 transition-colors">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <p className="text-lg text-foreground/80 group-hover:text-foreground transition-colors cursor-default">
                                            {feature}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative h-[500px] w-full bg-card rounded-3xl border border-border p-8 flex items-center justify-center overflow-hidden group">
                            {/* Glowing Orbs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />

                            {/* Central Hub */}
                            <div className="relative z-10 w-32 h-32 bg-card rounded-2xl border border-border flex items-center justify-center shadow-2xl">
                                <Rocket className="w-12 h-12 text-primary" />
                            </div>

                            {/* Orbiting Tech Icons */}
                            <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
                                {/* Top */}
                                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg">
                                    <Code2 className="w-5 h-5 text-rh-navy" />
                                </div>
                                {/* Right */}
                                <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg">
                                    <Cloud className="w-5 h-5 text-rh-gold" />
                                </div>
                                {/* Bottom */}
                                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg">
                                    <Server className="w-5 h-5 text-rh-emerald" />
                                </div>
                                {/* Left */}
                                <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg">
                                    <Database className="w-5 h-5 text-rh-navy" />
                                </div>
                            </div>

                            {/* Connecting Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" strokeDasharray="4 4" />
                                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                            </svg>
                        </div>
                    </div>
                </section>

                {/* Client Segments Section */}
                <section className="py-24 bg-secondary/20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4 text-foreground">
                                Who We Serve
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                From early-stage startups to established enterprises - we scale with you.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {clientSegments.map((segment, index) => (
                                <motion.div
                                    key={segment.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="bg-background rounded-3xl p-8 border border-border hover:border-primary/50 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 border border-border">
                                        <segment.icon className="w-8 h-8 stroke-[1.5]" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-3 font-batman">
                                        {segment.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        {segment.description}
                                    </p>

                                    <div className="space-y-2">
                                        {segment.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-foreground/80 text-xs">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-6 text-foreground">
                                Ready to Build Something Great?
                            </h2>
                            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
                                Let's discuss your project and see how we can help bring your vision to life with our end-to-end tech expertise.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="rounded-full md:text-[16px] font-semibold h-12 px-8"
                                    onClick={() => setShowContactDialog(true)}
                                >
                                    Start Your Project <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Link href="/contactus">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-full md:text-[16px] font-semibold h-12 px-8 bg-transparent border-border hover:bg-foreground/5 text-foreground backdrop-blur-sm"
                                    >
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Contact Dialog */}
            {showContactDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-rh-navy/60 backdrop-blur-sm" onClick={() => setShowContactDialog(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-card border border-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowContactDialog(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                <Phone className="w-8 h-8 text-primary" />
                            </div>

                            <h3 className="text-2xl font-bold font-batman text-foreground mb-2">
                                Let's Connect!
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Reach out to us directly
                            </p>

                            {/* Phone Number */}
                            <div className="bg-secondary/50 rounded-xl p-4 mb-6 border border-border">
                                <p className="text-sm text-muted-foreground mb-1">Call or WhatsApp</p>
                                <p className="text-2xl font-bold text-foreground tracking-wider">+91 8860761007</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <a
                                    href="tel:+919211265558"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 px-6 font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call Now
                                </a>
                                <a
                                    href="https://wa.me/919211265558?text=Hi%2C%20I%27m%20interested%20in%20your%20tech%20support%20services"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-rh-emerald hover:bg-[#0b6a4c] text-white rounded-full py-3 px-6 font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
