import type { Activity } from '@/payload-types'

export type BuyerActivityProperty = {
  id: string
  title: string
  slug: string | null
}

export type BuyerActivityPropertyMap = Record<string, BuyerActivityProperty>

export type BuyerActivityItem = {
  activity: Activity
  property?: BuyerActivityProperty
}
