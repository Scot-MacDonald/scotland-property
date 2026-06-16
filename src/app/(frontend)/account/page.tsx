import { BuyerHub } from '@/components/BuyerHub'

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">My Property Hub</p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Your property activity</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Keep track of saved homes, saved searches and properties you recently viewed.
        </p>
      </div>

      <BuyerHub />
    </main>
  )
}
