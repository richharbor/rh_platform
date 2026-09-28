"use client";

import { ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

interface DisclosureProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export default function Disclosure({ title, description, children }: DisclosureProps) {
    return (
        <section className="py-20">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="max-w-4xl mx-auto bg-white border border-neutral-200 p-8 md:p-10 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold font-batman text-neutral-900 mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-yellow-600" />
                                {title}
                            </h3>

                            {children && (
                                <div className="space-y-4 mb-8">
                                    {children}
                                </div>
                            )}

                            <p className="text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-6">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
