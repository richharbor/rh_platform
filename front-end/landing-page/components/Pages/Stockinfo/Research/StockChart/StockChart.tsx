"use client";
import { useEffect } from "react";

export default function TradingViewWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      new TradingView.widget({
        container_id: "tradingview_chart",
        autosize: true,
        symbol: "RELIANCE", // example symbol
        interval: "D",
        theme: "dark",
        style: "3",
        locale: "en",
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full h-[400px] rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div id="tradingview_chart" className="w-full h-full" />
    </div>
  );
}