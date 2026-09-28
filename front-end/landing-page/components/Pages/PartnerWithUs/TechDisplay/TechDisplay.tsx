"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import dashboardImg from '@/public/images/dashboard.png'

export function TechDisplay() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-5xl max-md:text-4xl max-sm:text-2xl font-batman font-semibold text-white py-10 max-sm:py-2">
              The Future at Your Fingertips
            </h2>
          </>
        }
      >
        <img
          src="https://i.pinimg.com/1200x/83/de/2f/83de2fdbb25159019ae16b9f8ecc7fff.jpg"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
