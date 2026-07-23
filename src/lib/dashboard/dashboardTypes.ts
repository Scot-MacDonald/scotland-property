export type DashboardUser = {
  id: string

  collection?: string

  name?: string | null

  email?: string | null

  role?: string | null

  agency?: string | { id?: string | null; name?: string | null } | null
}
