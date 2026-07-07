type Props = {
  totalProperties: number
}

export function SearchHero({ totalProperties }: Props) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-[1680px] px-6 py-20">
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">
          Scotland Luxury Estates
        </p>

        <h1 className="mt-6 max-w-5xl text-6xl font-light leading-none tracking-tight">
          Properties for Sale in Scotland
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-neutral-600">
          Discover castles, country estates, waterfront homes, lodges and exceptional residences
          across Scotland.
        </p>

        <div className="mt-10 border-t pt-6">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            {totalProperties.toLocaleString('en-GB')} Properties Available
          </p>
        </div>
      </div>
    </section>
  )
}
