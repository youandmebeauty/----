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
        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
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
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                            {item.revenue.toFixed(2)} DT
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground truncate max-w-full">
                                    {item.date}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Total</p>
                            <p className="text-sm font-medium">
                                {data.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)} DT
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Moyenne</p>
                            <p className="text-sm font-medium">
                                {(data.reduce((sum, item) => sum + item.revenue, 0) / data.length).toFixed(2)} DT
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Plus haut</p>
                            <p className="text-sm font-medium">
                                {Math.max(...data.map(d => d.revenue)).toFixed(2)} DT
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 text-sm pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary/20 rounded"></div>
                            <span className="text-muted-foreground">Revenus journaliers</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}