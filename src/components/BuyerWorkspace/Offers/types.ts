export type BuyerOfferProperty = {
  id: string
  title: string
  slug: string | null
}

export type BuyerOfferAgent = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
}

export type BuyerOffer = {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'draft' | 'submitted' | 'negotiating' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt?: string | null
  expiresAt?: string | null
  conditions?: string | null
  vendorResponse?: string | null
  buyerResponse?: string | null
  createdAt: string
  updatedAt: string
  property: BuyerOfferProperty
  agent?: BuyerOfferAgent | null
}
