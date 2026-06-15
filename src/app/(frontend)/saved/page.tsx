import { SavedPropertiesList } from '@/components/SavedPropertiesList'

export default function SavedPage() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Saved Properties
        </p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Your saved homes</h1>
      </div>

      <SavedPropertiesList />
    </main>
  )
}
