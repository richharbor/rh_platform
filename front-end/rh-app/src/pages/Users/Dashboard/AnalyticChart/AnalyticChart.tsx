"use client"

import { MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { quarter: "Q1", revenue: 2000000, target: 1800000 },
  { quarter: "Q2", revenue: 3000000, target: 2500000 },
  { quarter: "Q3", revenue: 2500000, target: 2800000 },
  { quarter: "Q4", revenue: 5000000, target: 4500000 },
  { quarter: "Q1", revenue: 6500000, target: 6000000 },
  { quarter: "Q2", revenue: 7200000, target: 6800000 },
  { quarter: "Q3", revenue: 8100000, target: 7500000 },
  { quarter: "Q4", revenue: 7800000, target: 7200000 },
]

export default function AnalyticChart() {
  return (
    <Card className="bg-slate-900 border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Analytic</h2>
        <div className="flex items-center gap-4">
          <select className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded border border-slate-700">
            <option>Sales Estimation</option>
          </select>
          <button className="text-slate-400 hover:text-slate-200">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="quarter" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#F3F4F6" }}
            formatter={(value: any) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#A78BFA"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#FCD34D"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
