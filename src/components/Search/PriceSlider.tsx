'use client'

import * as Slider from '@radix-ui/react-slider'

type Props = {
  minPrice?: string
  maxPrice?: string
  histogram?: number[]
  onChange: (values: { minPrice?: string; maxPrice?: string }) => void
}

const MIN = 0
const MAX = 10000000
const STEP = 100000

function formatPrice(value: number) {
  if (value === MIN) return 'No Min'
  if (value === MAX) return 'No Max'

  if (value >= 1000000) {
    const millions = value / 1000000
    return `£${millions % 1 === 0 ? millions : millions.toFixed(1)}m`
  }

  return `£${Math.round(value / 1000)}k`
}

export function PriceSlider({ minPrice, maxPrice, histogram = [], onChange }: Props) {
  const minValue = minPrice ? Number(minPrice) : MIN
  const maxValue = maxPrice ? Number(maxPrice) : MAX

  return (
    <div className="w-full space-y-10">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Min Price</p>
          <p className="mt-2 text-2xl font-light">{formatPrice(minValue)}</p>
        </div>

        <div className="border bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Max Price</p>
          <p className="mt-2 text-2xl font-light">{formatPrice(maxValue)}</p>
        </div>
      </div>
      {histogram.length > 0 ? (
        <div className="flex h-24 items-end gap-1 border-b border-neutral-300 pb-2">
          {histogram.map((value, index) => {
            const maxValue = Math.max(...histogram)
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0

            return (
              <div
                key={index}
                className="flex-1 bg-neutral-300"
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            )
          })}
        </div>
      ) : null}

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
        className="relative flex h-12 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-px w-full grow bg-neutral-300">
          <Slider.Range className="absolute h-full bg-black" />
        </Slider.Track>

        <Slider.Thumb
          aria-label="Minimum price"
          className="block h-7 w-7 border-2 border-black bg-white outline-none transition hover:bg-black focus-visible:bg-black"
        />

        <Slider.Thumb
          aria-label="Maximum price"
          className="block h-7 w-7 border-2 border-black bg-white outline-none transition hover:bg-black focus-visible:bg-black"
        />
      </Slider.Root>

      <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>£0</span>
        <span>£10m+</span>
      </div>
    </div>
  )
}
