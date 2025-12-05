import type { Product } from "@/lib/models"

export interface OrderAnalytics {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
}

export interface SalesData {
    date: string
    revenue: number
    orders: number
}

export interface TopProduct {
    product: Product
    totalSold: number
    revenue: number
}

export interface AnalyticsPeriod {
    today: OrderAnalytics
    week: OrderAnalytics
    month: OrderAnalytics
    salesChart: SalesData[]
    topProducts: TopProduct[]
}

// Dynamic imports for client-side Firebase
let firestoreModule: any = null
let db: any = null

const initFirestore = async () => {
    if (typeof window !== "undefined" && !firestoreModule) {
        const { db: database } = await import("@/lib/firebase")
        const {
            collection,
            getDocs,
            query,
            where,
            orderBy,
            limit,
        } = await import("firebase/firestore")

        firestoreModule = {
            collection,
            getDocs,
            query,
            where,
            orderBy,
            limit,
        }
        db = database
    }
}

const ORDERS_COLLECTION = "orders"

/**
 * Get analytics data for different time periods
 */
export async function getAnalytics(): Promise<AnalyticsPeriod> {
    await initFirestore()
    if (!firestoreModule || !db) {
        return {
            today: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            week: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            month: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            salesChart: [],
            topProducts: [],
        }
    }

    try {
        const ordersRef = firestoreModule.collection(db, ORDERS_COLLECTION)
        const snapshot = await firestoreModule.getDocs(ordersRef)

        const orders = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        }))

        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        // Calculate analytics for different periods
        const today = calculatePeriodAnalytics(orders, todayStart)
        const week = calculatePeriodAnalytics(orders, weekStart)
        const month = calculatePeriodAnalytics(orders, monthStart)

        // Generate sales chart data for the last 7 days
        const salesChart = generateSalesChart(orders, 7)

        // Get top 5 products
        const topProducts = getTopProducts(orders, 5)

        return {
            today,
            week,
            month,
            salesChart,
            topProducts,
        }
    } catch (error) {
        console.error("Error fetching analytics:", error)
        return {
            today: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            week: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            month: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
            salesChart: [],
            topProducts: [],
        }
    }
}

function calculatePeriodAnalytics(orders: any[], startDate: Date): OrderAnalytics {
    const periodOrders = orders.filter((order) => new Date(order.createdAt) >= startDate)

    const totalRevenue = periodOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalOrders = periodOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
    }
}

function generateSalesChart(orders: any[], days: number): SalesData[] {
    const chart: SalesData[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

        const dayOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt)
            return orderDate >= dayStart && orderDate < dayEnd
        })

        const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)

        chart.push({
            date: dayStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
            revenue,
            orders: dayOrders.length,
        })
    }

    return chart
}

function getTopProducts(orders: any[], limit: number): TopProduct[] {
    const productMap = new Map<string, { product: any; totalSold: number; revenue: number }>()

    orders.forEach((order) => {
        order.items?.forEach((item: any) => {
            const existing = productMap.get(item.productId)
            if (existing) {
                existing.totalSold += item.quantity
                existing.revenue += item.price * item.quantity
            } else {
                productMap.set(item.productId, {
                    product: item,
                    totalSold: item.quantity,
                    revenue: item.price * item.quantity,
                })
            }
        })
    })

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
}
