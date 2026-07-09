import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardToolbar } from '@/components/DashboardV2/Collection/DashboardToolbar'
import { DashboardPriorityPanel } from '@/components/DashboardV2/Cards/DashboardPriorityPanel'
import { DashboardPropertyCard } from '@/components/DashboardV2/Cards/DashboardPropertyCard'
import { DashboardQuickActions } from '@/components/DashboardV2/Cards/DashboardQuickActions'
import { DashboardHero } from '@/components/DashboardV2/Layout/DashboardHero'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'

export default function DashboardV2Page() {
  return (
    <DashboardLayout>
      <DashboardHero agencyName="Rettie & Co." />

      <DashboardWorkspace>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <DashboardToolbar
              searchPlaceholder="Search properties..."
              actionHref="/dashboard/properties/new"
              actionLabel="Add Property"
              view="list"
            />

            <DashboardCollection empty={false} showPagination={false}>
              <DashboardPropertyCard
                title="Ardanaiseig House"
                location="Argyll and Bute"
                price="£3,250,000"
                status="For Sale"
                reference="RET-001"
                bedrooms={7}
                bathrooms={5}
                featured
              />

              <DashboardPropertyCard
                title="Highland Estate"
                location="Inverness-shire"
                price="£2,850,000"
                status="Featured"
                reference="RET-002"
                bedrooms={6}
                bathrooms={4}
                featured
              />

              <DashboardPropertyCard
                title="Lochside Residence"
                location="Perthshire"
                price="£1,950,000"
                status="Reserved"
                reference="RET-003"
                bedrooms={5}
                bathrooms={3}
              />
            </DashboardCollection>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-8">
            <DashboardPriorityPanel />
            <DashboardQuickActions />
          </aside>
        </div>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
