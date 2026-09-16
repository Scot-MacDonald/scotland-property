import { BuyerViewingCard } from './BuyerViewingCard'
import type { BuyerViewing } from './types'

type BuyerViewingsListProps = {
  viewings: BuyerViewing[]
}

export function BuyerViewingsList({ viewings }: BuyerViewingsListProps) {
  return (
    <div className="space-y-4">
      {viewings.map((viewing) => (
        <BuyerViewingCard key={viewing.id} viewing={viewing} />
      ))}
    </div>
  )
}
