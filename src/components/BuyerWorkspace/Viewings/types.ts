export type BuyerViewingProperty = {
  id: string
  title: string
  slug: string | null
  latitude?: number | null
  longitude?: number | null
}

export type BuyerViewingAgent = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
}

export type BuyerViewing = {
  id: string
  dateTime: string
  durationMinutes: number
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  property: BuyerViewingProperty
  agent?: BuyerViewingAgent | null
  viewerRating?: number | null
  viewingOutcome?:
    | 'not-recorded'
    | 'interested'
    | 'second-viewing'
    | 'considering-offer'
    | 'offer-expected'
    | 'not-interested'
    | null
  feedback?: string | null
}
