"use client"

import { MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"

const data = [
  { country: "United States", value: 85, flag: "🇺🇸" },
  { country: "Japan", value: 70, flag: "🇯🇵" },
  { country: "Indonesia", value: 45, flag: "🇮🇩" },
  { country: "South Korea", value: 38, flag: "🇰🇷" },
]

export default function SessionChart() {
  return (
    <Card className="bg-slate-900 border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Session by Country</h2>
        <button className="text-slate-400 hover:text-slate-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xl w-6">{item.flag}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">{item.country}</span>
                <span className="text-sm font-semibold text-white">{item.value}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-primary/50 h-2 rounded-full transition-all"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
