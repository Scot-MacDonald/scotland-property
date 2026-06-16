import { SavedSearchesList } from '@/components/SavedSearchesList'

export default function SavedSearchesPage() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Saved Searches</p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Property alerts</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Manage searches you'd like to revisit or receive alerts for.
        </p>
      </div>

      <SavedSearchesList />
    </main>
  )
}
