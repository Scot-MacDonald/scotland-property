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

export function PriceSlider({ minPrice, maxPrice, onChange }: Props) {
  const minValue = minPrice ? Number(minPrice) : MIN
  const maxValue = maxPrice ? Number(maxPrice) : MAX

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3">
        <div className="border bg-white px-4 py-3">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Min Price
          </p>

          <p className="mt-1 text-lg font-light">{formatPrice(minValue)}</p>
        </div>

        <div className="border bg-white px-4 py-3">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Max Price
          </p>

          <p className="mt-1 text-lg font-light">{formatPrice(maxValue)}</p>
        </div>
      </div>

      <div className="mt-5">
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
          <Slider.Track className="relative h-px w-full grow bg-neutral-300">
            <Slider.Range className="absolute h-full bg-black" />
          </Slider.Track>

          <Slider.Thumb
            aria-label="Minimum price"
            className="block h-5 w-5 border-2 border-black bg-white outline-none transition hover:bg-black focus-visible:bg-black"
          />

          <Slider.Thumb
            aria-label="Maximum price"
            className="block h-5 w-5 border-2 border-black bg-white outline-none transition hover:bg-black focus-visible:bg-black"
          />
        </Slider.Root>

        <div className="mt-1 flex justify-between text-[9px] uppercase tracking-[0.18em] text-neutral-500">
          <span>£0</span>
          <span>£10m+</span>
        </div>
      </div>
    </div>
  )
}
