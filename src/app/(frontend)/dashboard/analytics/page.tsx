import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AnalyticsStatusChart } from '@/components/AnalyticsStatusChart'

export default async function AnalyticsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agencyFilter: any =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

  const valuationLeadFilter: any =
    !isSuperAdmin && agencyId
      ? {
          assignedAgency: {
            equals: agencyId,
          },
        }
      : {}

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    liveProperties,
    soldProperties,
    featuredProperties,
    enquiriesThisMonth,
    valuationLeadsThisMonth,
    newValuationLeads,
    contactedValuationLeads,
    valuationsBooked,
    instructionsWon,
    lostValuationLeads,
    buyerEnquiries,
    newBuyerEnquiries,
    contactedBuyerEnquiries,
    viewingsBooked,
    offersMade,
    saleAgreed,
    completedBuyerEnquiries,
    lostBuyerEnquiries,
  ] = await Promise.all([
    payload.count({
      collection: 'properties',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'for-sale',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'properties',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'sold',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'properties',
      where: {
        and: [
          agencyFilter,
          {
            featured: {
              equals: true,
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            createdAt: {
              greater_than_equal: startOfMonth,
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            createdAt: {
              greater_than_equal: startOfMonth,
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            status: {
              equals: 'new',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            status: {
              equals: 'contacted',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            status: {
              equals: 'valuation-booked',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            status: {
              equals: 'instruction-won',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'valuation-leads',
      where: {
        and: [
          valuationLeadFilter,
          {
            status: {
              equals: 'lost',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: agencyFilter,
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'new',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'contacted',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'viewing-booked',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'offer-made',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'sale-agreed',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'completed',
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          agencyFilter,
          {
            status: {
              equals: 'lost',
            },
          },
        ],
      },
      overrideAccess: true,
    }),
  ])

  const sellerConversionRate =
    valuationLeadsThisMonth.totalDocs > 0
      ? Math.round((instructionsWon.totalDocs / valuationLeadsThisMonth.totalDocs) * 100)
      : 0

  const buyerConversionRate =
    buyerEnquiries.totalDocs > 0
      ? Math.round((saleAgreed.totalDocs / buyerEnquiries.totalDocs) * 100)
      : 0

  const sellerChartData = [
    { label: 'New', count: newValuationLeads.totalDocs },
    { label: 'Contacted', count: contactedValuationLeads.totalDocs },
    { label: 'Booked', count: valuationsBooked.totalDocs },
    { label: 'Won', count: instructionsWon.totalDocs },
    { label: 'Lost', count: lostValuationLeads.totalDocs },
  ]

  const buyerChartData = [
    { label: 'New', count: newBuyerEnquiries.totalDocs },
    { label: 'Contacted', count: contactedBuyerEnquiries.totalDocs },
    { label: 'Viewings', count: viewingsBooked.totalDocs },
    { label: 'Offers', count: offersMade.totalDocs },
    { label: 'Agreed', count: saleAgreed.totalDocs },
    { label: 'Completed', count: completedBuyerEnquiries.totalDocs },
    { label: 'Lost', count: lostBuyerEnquiries.totalDocs },
  ]

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Agency Analytics
          </p>

          <h1 className="mt-2 text-5xl font-medium tracking-tight">Performance Overview</h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Track listings, buyer enquiries and seller valuation performance in one place.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Live Properties" value={liveProperties.totalDocs} />
        <AnalyticsCard title="Sold Properties" value={soldProperties.totalDocs} />
        <AnalyticsCard title="Featured Listings" value={featuredProperties.totalDocs} />
        <AnalyticsCard title="Enquiries This Month" value={enquiriesThisMonth.totalDocs} />
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="border p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Seller Pipeline
          </p>

          <h2 className="mt-2 text-3xl font-medium">Valuation Performance</h2>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <AnalyticsCard title="Leads This Month" value={valuationLeadsThisMonth.totalDocs} />
            <AnalyticsCard title="New Leads" value={newValuationLeads.totalDocs} />
            <AnalyticsCard title="Valuations Booked" value={valuationsBooked.totalDocs} />
            <AnalyticsCard title="Instructions Won" value={instructionsWon.totalDocs} />
          </div>

          <div className="mt-8 border p-6">
            <p className="text-sm text-muted-foreground">Seller Conversion Rate</p>
            <p className="mt-2 text-5xl font-medium">{sellerConversionRate}%</p>
          </div>
        </div>

        <div className="border p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Buyer Pipeline
          </p>

          <h2 className="mt-2 text-3xl font-medium">Buyer Enquiry Performance</h2>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <AnalyticsCard title="Total Enquiries" value={buyerEnquiries.totalDocs} />
            <AnalyticsCard title="Viewings Booked" value={viewingsBooked.totalDocs} />
            <AnalyticsCard title="Offers Made" value={offersMade.totalDocs} />
            <AnalyticsCard title="Sale Agreed" value={saleAgreed.totalDocs} />
          </div>

          <div className="mt-8 border p-6">
            <p className="text-sm text-muted-foreground">Buyer Conversion Rate</p>
            <p className="mt-2 text-5xl font-medium">{buyerConversionRate}%</p>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Seller Pipeline Overview
          </p>

          <AnalyticsStatusChart data={sellerChartData} />
        </div>

        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Buyer Pipeline Overview
          </p>

          <AnalyticsStatusChart data={buyerChartData} />
        </div>
      </section>

      <section className="mt-16 grid gap-3 lg:grid-cols-3">
        <Link href="/dashboard/pipeline" className="border p-8">
          <h2 className="text-2xl font-medium">Seller Pipeline</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Review seller leads and instructions won.
          </p>
        </Link>

        <Link href="/dashboard/enquiries/pipeline" className="border p-8">
          <h2 className="text-2xl font-medium">Buyer Pipeline</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Review buyer enquiries and sales progress.
          </p>
        </Link>

        <Link href="/dashboard/properties" className="border p-8">
          <h2 className="text-2xl font-medium">Manage Listings</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Review live, featured and sold properties.
          </p>
        </Link>
      </section>
    </main>
  )
}

function AnalyticsCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="border bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-4 text-5xl font-medium">{value}</p>
    </div>
  )
}
