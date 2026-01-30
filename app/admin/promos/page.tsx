"use client"

import PromoManager from "@/components/admin/promo-manager"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"

export default function AdminPromosPage() {
  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background p-4 w-full lg:w-10/12">
        <div className="container mx-auto">
          <PromoManager />
        </div>
      </div>
    </AdminRouteGuard>
  )
}
