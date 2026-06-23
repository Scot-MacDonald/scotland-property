import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

export default async function AgenciesPage() {
  const payload = await getPayload({ config: configPromise })

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 1,
    limit: 100,
    sort: 'name',
    overrideAccess: true,
  })

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <p className="mb-3 text-sm uppercase tracking-[0.25em] text-muted-foreground">
        Estate Agencies
      </p>

      <h1 className="text-5xl font-medium tracking-tight">Scottish property agencies</h1>

      <p className="mt-4 max-w-2xl text-muted-foreground">
        Browse estate agencies listing exceptional homes, estates and country properties across
        Scotland.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agencies.docs.map((agency) => {
          const logo = typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null

          return (
            <Link
              key={agency.id}
              href={`/agency/${agency.slug}`}
              className="group border border-neutral-200 p-6 transition hover:border-black"
            >
              <div className="mb-6 flex h-24 items-center justify-center border bg-white">
                {logo ? (
                  <img
                    src={logo}
                    alt={agency.name}
                    className="max-h-16 max-w-[180px] object-contain"
                  />
                ) : (
                  <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {agency.name}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-medium">{agency.name}</h2>

              {agency.address?.city && (
                <p className="mt-2 text-sm text-muted-foreground">{agency.address.city}</p>
              )}

              {agency.description && (
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                  {agency.description}
                </p>
              )}

              <p className="mt-6 text-sm underline">View agency</p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
