"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { date: "Mon", present: 50, absent: 5, leave: 2 },
  { date: "Tue", present: 55, absent: 3, leave: 1 },
  { date: "Wed", present: 48, absent: 7, leave: 0 },
  { date: "Thu", present: 52, absent: 2, leave: 3 },
  { date: "Fri", present: 60, absent: 1, leave: 1 },
  { date: "Sat", present: 20, absent: 0, leave: 0 },
]

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--chart-1))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--destructive))",
  },
  leave: {
    label: "Leave",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function AttendanceSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Weekly Attendance Summary</CardTitle>
        <CardDescription>Overview of laborer attendance for the current week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip cursor={{ fill: "hsl(var(--accent)/0.3)" }} content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leave" fill="var(--color-leave)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
