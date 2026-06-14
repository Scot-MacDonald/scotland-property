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
      <div className="flex h-[320px] items-center justify-center bg-muted text-muted-foreground">
        No image
      </div>
    )
  }

  return (
    <div className="relative h-[320px] overflow-hidden">
      <img
        src={currentImage.url}
        alt={currentImage.alt || title}
        className="h-full w-full object-cover"
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              setIndex((current) => (current === 0 ? images.length - 1 : current - 1))
            }}
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              setIndex((current) => (current === images.length - 1 ? 0 : current + 1))
            }}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`h-1.5 w-1.5 rounded-full ${
                  dotIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 text-xs text-white">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}
