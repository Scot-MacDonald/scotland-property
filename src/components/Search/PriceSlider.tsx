'use client'

import * as Slider from '@radix-ui/react-slider'

type Props = {
  minPrice?: string
  maxPrice?: string
  onChange: (values: { minPrice?: string; maxPrice?: string }) => void
}

const MIN = 0
const MAX = 10000000
const STEP = 100000

function formatPrice(value: number) {
  if (value === 0) return 'No Min'
  if (value === MAX) return 'No Max'

  if (value >= 1000000) {
    return `£${value / 1000000}m`
  }

  return `£${value / 1000}k`
}

export function PriceSlider({ minPrice, maxPrice, onChange }: Props) {
  const minValue = minPrice ? Number(minPrice) : MIN
  const maxValue = maxPrice ? Number(maxPrice) : MAX

  return (
    <div className="w-full space-y-8">
      <Slider.Root
        value={[minValue, maxValue]}
        min={MIN}
        max={MAX}
        step={STEP}
        minStepsBetweenThumbs={1}
        onValueChange={([nextMin, nextMax]) => {
          onChange({
            minPrice: nextMin === MIN ? undefined : String(nextMin),
            maxPrice: nextMax === MAX ? undefined : String(nextMax),
          })
        }}
        className="relative flex h-8 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1 w-full grow bg-neutral-200">
          <Slider.Range className="absolute h-full bg-black" />
        </Slider.Track>

        <Slider.Thumb className="block h-8 w-8 border-4 border-black bg-white outline-none" />
        <Slider.Thumb className="block h-8 w-8 border-4 border-black bg-white outline-none" />
      </Slider.Root>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Min Price</p>
          <p className="mt-2 text-xl font-light">{formatPrice(minValue)}</p>
        </div>

        <div className="border bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Max Price</p>
          <p className="mt-2 text-xl font-light">{formatPrice(maxValue)}</p>
        </div>
      </div>
    </div>
  )
}
