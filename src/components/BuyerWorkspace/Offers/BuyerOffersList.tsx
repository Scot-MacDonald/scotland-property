import { BuyerOfferCard } from './BuyerOfferCard'
import type { BuyerOffer } from './types'

type BuyerOffersListProps = {
  offers: BuyerOffer[]
}

export function BuyerOffersList({ offers }: BuyerOffersListProps) {
  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <BuyerOfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}
