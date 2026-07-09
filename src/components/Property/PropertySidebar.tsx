import Link from 'next/link'
import { PropertyEnquiryForm } from '@/components/PropertyEnquiryForm'

type Props = {
  property: any
}

export function PropertySidebar({ property }: Props) {
  const agency = typeof property.agency === 'object' ? property.agency : null
  const agent = typeof property.agent === 'object' ? property.agent : null

  return (
    <aside className="mt-[120px] h-fit border p-6 lg:sticky lg:top-8">
      {agency?.name && (
        <Link href={`/agency/${agency.slug}`} className="mb-6 block">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{agency.name}</p>
        </Link>
      )}

      {agent?.name && (
        <div className="mb-6 border-t pt-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Contact agent
          </p>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
              {typeof agent.photo === 'object' && agent.photo?.url ? (
                <img
                  src={agent.photo.url}
                  alt={agent.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-medium">
                  {agent.name
                    .split(' ')
                    .map((word: string) => word[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              )}
            </div>

            <div>
              <p className="text-lg font-medium">{agent.name}</p>

              {agent.jobTitle && <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>}
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            {agent.email && <p>{agent.email}</p>}
            {agent.phone && <p>{agent.phone}</p>}
          </div>
        </div>
      )}

      <div className="space-y-3 border-t pt-6">
        <PropertyEnquiryForm propertyId={String(property.id)} />

        <button className="w-full border px-4 py-3">Request Details</button>

        <button className="w-full border px-4 py-3">Schedule Viewing</button>
      </div>
    </aside>
  )
}
