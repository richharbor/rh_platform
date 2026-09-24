"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

const Whatsapp = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query.`;

  return (
    <div className="relative z-50 flex flex-col items-end">
      {/* Popup Message */}
      {showPopup && (
        <div className="absolute bottom-[60px] right-0 mb-2 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300 z-50 whitespace-nowrap min-w-[200px]">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-3"
          >
            <div className="relative w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              <Image
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                width={20}
                height={20}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Start chat now</span>
              <span className="text-[11px] text-gray-500">We typically reply instantly</span>
            </div>
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPopup(false);
            }}
            className="ml-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            aria-label="Close popup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Chat bubble tail */}
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
        </div>
      )}

      {/* Main WhatsApp Icon */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-110 transition-transform duration-300 drop-shadow-lg"
      >
        <Image
          src="/icons/whatsapp.svg"
          alt="WhatsApp"
          width={55}
          height={55}
        />
      </a>
    </div>
  );
};

export default Whatsapp;
