'use client'

import { useState } from 'react'

type ImageItem = {
  url: string
  alt?: string | null
}

type Props = {
  images: ImageItem[]
  title: string
}

export function PropertyCardSlider({ images, title }: Props) {
  const [index, setIndex] = useState(0)

  const hasMultipleImages = images.length > 1
  const currentImage = images[index]

  if (!currentImage) {
    return (
      <div className="flex h-[340px] items-center justify-center border-b bg-[#f7f6f2] text-sm uppercase tracking-[0.2em] text-neutral-400">
        No image
      </div>
    )
  }

  return (
    <div className="relative h-[340px] overflow-hidden bg-[#f7f6f2]">
      <img
        src={currentImage.url}
        alt={currentImage.alt || title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />

      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.preventDefault()
              setIndex((current) => (current === 0 ? images.length - 1 : current - 1))
            }}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/80 bg-black/20 text-2xl leading-none text-white opacity-0 transition hover:bg-black group-hover:opacity-100"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.preventDefault()
              setIndex((current) => (current === images.length - 1 ? 0 : current + 1))
            }}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/80 bg-black/20 text-2xl leading-none text-white opacity-0 transition hover:bg-black group-hover:opacity-100"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-4 flex gap-1.5">
            {images.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`block h-px transition-all ${
                  dotIndex === index ? 'w-8 bg-white' : 'w-4 bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 right-4 border border-white/70 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.15em] text-white">
            {index + 1} / {images.length}
          </div>
        </>
      ) : null}
    </div>
  )
}
