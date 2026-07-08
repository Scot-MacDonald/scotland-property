type Props = {
  price?: number | null
}

export function PropertyPrice({ price }: Props) {
  if (!price) {
    return <p className="text-2xl font-light tracking-tight">Price on Application</p>
  }

  return <p className="text-2xl font-light tracking-tight">£{price.toLocaleString('en-GB')}</p>
}
