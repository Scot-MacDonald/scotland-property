import { ValuationLeadForm } from '@/components/ValuationLeadForm'
import Link from 'next/link'

export default function SellPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.2fr_520px]">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Sell Your Property
          </p>

          <h1 className="mt-4 max-w-5xl text-5xl font-medium tracking-tight md:text-7xl">
            Find the right Scottish agency for your property.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Request a free valuation and connect with specialist agents handling premium homes,
            estates, land and unique properties across Scotland.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature
              title="Specialist agencies"
              text="Connect with agents who understand Scotland’s premium property market."
            />
            <Feature
              title="No obligation"
              text="Send your details and decide later if you want to move forward."
            />
            <Feature
              title="Luxury focus"
              text="Designed for distinctive homes, estates, land and high-value listings."
            />
          </div>

          <section className="mt-16 border p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              How it works
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Step
                number="01"
                title="Submit details"
                text="Tell us where the property is and what type of home or asset it is."
              />
              <Step
                number="02"
                title="Review"
                text="Your request is recorded and can be assigned to a suitable agency."
              />
              <Step
                number="03"
                title="Valuation"
                text="An agent contacts you to discuss value, strategy and next steps."
              />
            </div>
          </section>

          <div className="mt-10">
            <Link href="/properties" className="text-sm underline">
              Browse properties first →
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ValuationLeadForm />
        </aside>
      </section>
    </main>
  )
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="border p-6">
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{number}</p>
      <h3 className="mt-2 text-xl font-medium">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}
