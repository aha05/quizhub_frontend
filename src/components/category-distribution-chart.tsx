"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Programming", value: 3245, color: "#8b5cf6" },
  { name: "Geography", value: 2890, color: "#10b981" },
  { name: "Mathematics", value: 2134, color: "#f59e0b" },
  { name: "History", value: 1876, color: "#ec4899" },
  { name: "Science", value: 1654, color: "#3b82f6" },
]

export function CategoryDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8b5cf6"
          dataKey="value"
          stroke="#2a2a2a"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-card p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Category</span>
                      <span className="font-bold text-foreground">{payload[0].name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Attempts</span>
                      <span className="font-bold text-foreground">{payload[0].value?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
