import RichText from '@/components/RichText'

type Props = {
  property: any
}

export function PropertyDescription({ property }: Props) {
  if (!property.description) return null

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-xl font-medium">About this property</h2>

      <div className="prose prose-neutral max-w-none">
        <RichText data={property.description} />
      </div>
    </section>
  )
}
