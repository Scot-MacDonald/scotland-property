// src/lib/dashboard/dashboardTypes.ts

export type DashboardUser = {
  collection?: string
  role?: string | null
  name?: string | null
  agency?: string | { id?: string | null } | null
}
