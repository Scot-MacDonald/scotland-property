import { RecentlyViewedList } from '@/components/RecentlyViewedList'

export default function RecentlyViewedPage() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Recently Viewed</p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Properties you've viewed</h1>
      </div>

      <RecentlyViewedList />
    </main>
  )
}
