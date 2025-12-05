"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalesData } from "@/lib/services/analytics-service"

interface AnalyticsChartProps {
    data: SalesData[]
    title: string
}

export function AnalyticsChart({ data, title }: AnalyticsChartProps) {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

    return (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle className="font-serif text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Simple bar chart */}
                    <div className="flex items-end justify-between gap-2 h-48">
                        {data.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="relative w-full flex-1 flex items-end">
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t relative group"
                                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                                            {item.revenue.toFixed(2)}€
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{item.date}</span>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary/20 rounded"></div>
                            <span className="text-muted-foreground">Revenus</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
