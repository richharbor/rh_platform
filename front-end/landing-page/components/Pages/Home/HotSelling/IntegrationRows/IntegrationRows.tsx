"use client";

import React, { Fragment } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

const IntegrationRows = (props: {
    integrations: { name: string; icon: string; sector: string }[];
    className?: string;
    reverse?: boolean;
}) => {
    const { integrations, className, reverse } = props;
    return (
        <motion.div
            initial={{
                x: reverse ? "0%" : "-50%",
            }}
            animate={{
                x: reverse ? "-50%" : "0%",
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                from: reverse ? "-50%" : 0,
            }}
            className={twMerge("flex flex-row gap-4 pb-4", className)}
        >
            {Array.from({ length: 2 }).map((_, i) => (
                <Fragment key={i}>
                    {integrations.map((integration) => (
                        <div
                            key={integration.name}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-6 min-w-[250px] max-sm:min-w-[150px] flex-shrink-0"
                        >
                            <div className="flex justify-center">
                                <Image
                                    className="size-24 max-sm:size-15"
                                    src={integration.icon}
                                    alt={`${integration.name}-icon`}
                                />
                            </div>
                            <h3 className="text-3xl max-sm:text-xl text-center mt-6 ">
                                {integration.name}
                            </h3>
                            <p className="text-center text-white/50 mt-2 ">
                                {integration.sector}
                            </p>
                        </div>
                    ))}
                </Fragment>
            ))}
        </motion.div>
    );
};

export default IntegrationRows;