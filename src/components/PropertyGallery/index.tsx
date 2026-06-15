'use client'

import { useEffect, useState } from 'react'

type GalleryImage = {
  url: string
  alt: string
}

type Props = {
  images: GalleryImage[]
  title: string
}

export function PropertyGallery({ images, title }: Props) {
  const [gridOpen, setGridOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const activeImage = images[activeIndex]

  function openGrid() {
    setGridOpen(true)
  }

  function openViewer(index: number) {
    if (!images[index]) return

    setActiveIndex(index)
    setViewerOpen(true)
  }

  function closeAll() {
    setViewerOpen(false)
    setGridOpen(false)
  }

  function previousImage() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  function nextImage() {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  useEffect(() => {
    if (!gridOpen && !viewerOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAll()
      }

      if (viewerOpen && event.key === 'ArrowLeft') {
        previousImage()
      }

      if (viewerOpen && event.key === 'ArrowRight') {
        nextImage()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gridOpen, viewerOpen])

  return (
    <>
      <div className="relative grid gap-[2px] lg:h-[58vh] lg:grid-cols-[2fr_1fr_1fr]">
        <button
          type="button"
          onClick={openGrid}
          className="absolute bottom-4 right-4 z-10 bg-white/95 px-4 py-2 text-sm font-medium text-black shadow-md backdrop-blur"
        >
          View all {images.length} photos
        </button>{' '}
        <button
          type="button"
          className="overflow-hidden bg-muted text-left lg:row-span-2"
          onClick={openGrid}
        >
          {images[0]?.url ? (
            <img
              src={images[0].url}
              alt={images[0].alt || title}
              className="h-full w-full object-cover "
            />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </button>
        {[images[1], images[2], images[3], images[4]].map((image, index) => (
          <button
            key={index}
            type="button"
            className="overflow-hidden bg-muted text-left"
            onClick={openGrid}
          >
            {image?.url ? (
              <img
                src={image.url}
                alt={image.alt || title}
                className="h-full w-full object-cover "
              />
            ) : (
              <div className="flex h-full min-h-[140px] items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </button>
        ))}
      </div>

      {gridOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-black">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">{images.length} photos</p>
              <h2 className="text-lg font-medium">{title}</h2>
            </div>

            <button type="button" className="text-sm underline" onClick={() => setGridOpen(false)}>
              Close
            </button>
          </div>

          <div className="mx-auto grid max-w-[1500px] gap-3 px-6 py-8 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                className="overflow-hidden bg-muted text-left"
                onClick={() => openViewer(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || title}
                  className="aspect-[4/3] w-full object-cover "
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {viewerOpen && activeImage?.url && (
        <div className="fixed inset-0 z-[60] bg-black text-white">
          <div className="absolute left-6 top-6 text-sm">
            {activeIndex + 1} / {images.length}
          </div>

          <button type="button" className="absolute right-6 top-6 text-sm" onClick={closeAll}>
            Close
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl"
              onClick={previousImage}
            >
              ‹
            </button>
          )}

          <div className="flex h-full flex-col items-center justify-center px-16">
            <img
              src={activeImage.url}
              alt={activeImage.alt || title}
              className="max-h-[75vh] max-w-full object-contain"
            />

            {images.length > 1 && (
              <div className="mt-6 flex max-w-full gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`overflow-hidden border ${
                      index === activeIndex ? 'border-white' : 'border-white/20'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || title}
                      className="h-16 w-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl"
              onClick={nextImage}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
