"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricsCardProps {
    title: string
    value: string
    change?: number
    icon: React.ReactNode
    format?: "currency" | "number"
}

export function MetricsCard({ title, value, change, icon, format = "number" }: MetricsCardProps) {
    const isPositive = change !== undefined && change >= 0

    return (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="text-muted-foreground">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <p className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(change)}% par rapport à la semaine dernière</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
