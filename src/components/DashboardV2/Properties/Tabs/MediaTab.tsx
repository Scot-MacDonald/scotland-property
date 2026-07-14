'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type RefObject } from 'react'
import { useWorkspaceForm } from '@/hooks/useWorkspaceForm'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import type { Media, Property } from '@/payload-types'

type MediaValue = string | Media | null | undefined

type MediaItem = {
  id: string
  filename: string
  url: string
  alt: string
}

type MediaTabProps = {
  property: Property
}

function getMediaId(value: MediaValue) {
  if (!value) return null

  return typeof value === 'string' ? value : value.id
}

function getMediaUrl(value: MediaValue) {
  if (!value || typeof value === 'string') return null

  return value.url || null
}

function getMediaFilename(value: MediaValue) {
  if (!value || typeof value === 'string') return 'Property media'

  return value.filename || value.alt || 'Property media'
}

function getMediaAlt(value: MediaValue, fallback: string) {
  if (!value || typeof value === 'string') return fallback

  return value.alt || fallback
}

function normaliseMedia(value: MediaValue, fallback: string): MediaItem | null {
  const id = getMediaId(value)
  const url = getMediaUrl(value)

  if (!id || !url) {
    return null
  }

  return {
    id,
    url,
    filename: getMediaFilename(value),
    alt: getMediaAlt(value, fallback),
  }
}

function normaliseMediaList(values: MediaValue[] | null | undefined, fallback: string) {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => normaliseMedia(value, fallback))
    .filter((value): value is MediaItem => Boolean(value))
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)

  if (!movedItem) {
    return items
  }

  nextItems.splice(toIndex, 0, movedItem)

  return nextItems
}

function FileDropzone({
  accept,
  description,
  inputRef,
  label,
  multiple = false,
  onChange,
}: {
  accept: string
  description: string
  inputRef: RefObject<HTMLInputElement | null>
  label: string
  multiple?: boolean
  onChange: (files: File[]) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files) return

    onChange(Array.from(files))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      className={[
        'border border-dashed px-6 py-8 transition',
        isDragging ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-300 bg-white',
      ].join(' ')}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragging(false)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        accept={accept}
        className="sr-only"
        multiple={multiple}
        type="file"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <div className="flex flex-col items-start gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-950">{label}</p>
          <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
        </div>

        <button
          type="button"
          className="border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </button>
      </div>
    </div>
  )
}

function SortableMediaCard({
  item,
  index,
  isLast,
  onMoveBackward,
  onMoveForward,
  onRemove,
}: {
  item: MediaItem
  index: number
  isLast: boolean
  onMoveBackward: () => void
  onMoveForward: () => void
  onRemove: () => void
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  })

  return (
    <article
      ref={setNodeRef}
      className={[
        'border border-neutral-200 bg-white',
        isDragging ? 'relative z-10 opacity-60 shadow-lg' : 'opacity-100',
      ].join(' ')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {/* Payload media can be dynamic and may not use the configured Next image domains. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={item.alt} className="h-full w-full object-cover" src={item.url} />

        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 touch-none cursor-grab items-center justify-center border border-white/70 bg-white/95 text-neutral-800 shadow-sm active:cursor-grabbing"
          aria-label={`Reorder ${item.filename}`}
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ⋮⋮
          </span>
        </button>
      </div>

      <div className="space-y-3 border-t border-neutral-200 p-3">
        <p className="truncate text-xs text-neutral-600" title={item.filename}>
          {item.filename}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-neutral-300 px-2 py-1 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={index === 0}
            onClick={onMoveBackward}
          >
            Previous
          </button>

          <button
            type="button"
            className="border border-neutral-300 px-2 py-1 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isLast}
            onClick={onMoveForward}
          >
            Next
          </button>

          <button
            type="button"
            className="ml-auto border border-red-200 px-2 py-1 text-xs text-red-700"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

function NewFileCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file])

  return (
    <article className="border border-neutral-200 bg-white">
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={file.name} className="h-full w-full object-cover" src={previewUrl} />
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-200 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-neutral-900">{file.name}</p>
          <p className="mt-1 text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>

        <button
          type="button"
          className="border border-red-200 px-2 py-1 text-xs text-red-700"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </article>
  )
}

export function MediaTab({ property }: MediaTabProps) {
  const initialFeaturedImage = useMemo(
    () => normaliseMedia(property.featuredImage, property.title),
    [property.featuredImage, property.title],
  )

  const initialGallery = useMemo(
    () => normaliseMediaList(property.gallery, property.title),
    [property.gallery, property.title],
  )

  const initialFloorPlans = useMemo(
    () => normaliseMediaList(property.floorPlans, `${property.title} floorplan`),
    [property.floorPlans, property.title],
  )

  const featuredInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const floorPlanInputRef = useRef<HTMLInputElement>(null)

  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(initialFeaturedImage)
  const [newFeaturedImage, setNewFeaturedImage] = useState<File | null>(null)

  const [gallery, setGallery] = useState<MediaItem[]>(initialGallery)
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])

  const [floorPlans, setFloorPlans] = useState<MediaItem[]>(initialFloorPlans)
  const [newFloorPlanFiles, setNewFloorPlanFiles] = useState<File[]>([])

  const [youtubeVideo, setYoutubeVideo] = useState(property.youtubeVideo || '')
  const [virtualTour, setVirtualTour] = useState(property.virtualTour || '')

  const [savedFeaturedImage, setSavedFeaturedImage] = useState<MediaItem | null>(
    initialFeaturedImage,
  )
  const [savedGallery, setSavedGallery] = useState<MediaItem[]>(initialGallery)
  const [savedFloorPlans, setSavedFloorPlans] = useState<MediaItem[]>(initialFloorPlans)
  const [savedYoutubeVideo, setSavedYoutubeVideo] = useState(property.youtubeVideo || '')
  const [savedVirtualTour, setSavedVirtualTour] = useState(property.virtualTour || '')

  const { isSaving, message, error, beginSave, finishSave, failSave, clearMessages } =
    useWorkspaceForm()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function beginEdit() {
    clearMessages()
  }

  const isDirty =
    featuredImage?.id !== savedFeaturedImage?.id ||
    Boolean(newFeaturedImage) ||
    gallery.map((item) => item.id).join(',') !== savedGallery.map((item) => item.id).join(',') ||
    newGalleryFiles.length > 0 ||
    floorPlans.map((item) => item.id).join(',') !==
      savedFloorPlans.map((item) => item.id).join(',') ||
    newFloorPlanFiles.length > 0 ||
    youtubeVideo !== savedYoutubeVideo ||
    virtualTour !== savedVirtualTour

  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = gallery.findIndex((item) => item.id === active.id)
    const newIndex = gallery.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    beginEdit()
    setGallery((current) => arrayMove(current, oldIndex, newIndex))
  }

  function handleFloorPlanDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = floorPlans.findIndex((item) => item.id === active.id)
    const newIndex = floorPlans.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    beginEdit()
    setFloorPlans((current) => arrayMove(current, oldIndex, newIndex))
  }

  function discardChanges() {
    setFeaturedImage(savedFeaturedImage)
    setNewFeaturedImage(null)
    setGallery(savedGallery)
    setNewGalleryFiles([])
    setFloorPlans(savedFloorPlans)
    setNewFloorPlanFiles([])
    setYoutubeVideo(savedYoutubeVideo)
    setVirtualTour(savedVirtualTour)
    clearMessages()
  }

  async function saveMedia() {
    beginSave()

    try {
      const formData = new FormData()

      formData.set('id', property.id)
      formData.set('manageMedia', 'true')
      formData.set('youtubeVideo', youtubeVideo)
      formData.set('virtualTour', virtualTour)

      formData.set('featuredImageManaged', 'true')

      if (featuredImage) {
        formData.set('featuredImageId', featuredImage.id)
      }

      if (newFeaturedImage) {
        formData.set('featuredImage', newFeaturedImage)
      }

      formData.set('galleryManaged', 'true')

      for (const item of gallery) {
        formData.append('galleryIds', item.id)
      }

      for (const file of newGalleryFiles) {
        formData.append('galleryFiles', file)
      }

      formData.set('floorPlansManaged', 'true')

      for (const item of floorPlans) {
        formData.append('floorPlanIds', item.id)
      }

      for (const file of newFloorPlanFiles) {
        formData.append('floorPlanFiles', file)
      }

      const response = await fetch('/api/update-property', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        error?: string
        property?: Property
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update property media.')
      }

      if (result.property) {
        const nextFeaturedImage = normaliseMedia(
          result.property.featuredImage,
          result.property.title,
        )
        const nextGallery = normaliseMediaList(result.property.gallery, result.property.title)
        const nextFloorPlans = normaliseMediaList(
          result.property.floorPlans,
          `${result.property.title} floorplan`,
        )
        const nextYoutubeVideo = result.property.youtubeVideo || ''
        const nextVirtualTour = result.property.virtualTour || ''

        setFeaturedImage(nextFeaturedImage)
        setGallery(nextGallery)
        setFloorPlans(nextFloorPlans)
        setYoutubeVideo(nextYoutubeVideo)
        setVirtualTour(nextVirtualTour)

        setSavedFeaturedImage(nextFeaturedImage)
        setSavedGallery(nextGallery)
        setSavedFloorPlans(nextFloorPlans)
        setSavedYoutubeVideo(nextYoutubeVideo)
        setSavedVirtualTour(nextVirtualTour)
      }

      setNewFeaturedImage(null)
      setNewGalleryFiles([])
      setNewFloorPlanFiles([])
      finishSave('Media saved successfully.')
    } catch (saveError) {
      failSave(saveError, 'Could not save media.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Featured image"
        description="Choose the primary image used on property cards and listing pages."
      >
        <div className="space-y-5">
          {featuredImage && !newFeaturedImage ? (
            <div className="max-w-2xl border border-neutral-200">
              <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={featuredImage.alt}
                  className="h-full w-full object-cover"
                  src={featuredImage.url}
                />
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-200 p-4">
                <p className="min-w-0 flex-1 truncate text-sm text-neutral-700">
                  {featuredImage.filename}
                </p>

                <button
                  type="button"
                  className="border border-neutral-300 px-3 py-2 text-sm text-neutral-700"
                  onClick={() => featuredInputRef.current?.click()}
                >
                  Replace
                </button>

                <button
                  type="button"
                  className="border border-red-200 px-3 py-2 text-sm text-red-700"
                  onClick={() => {
                    beginEdit()
                    setFeaturedImage(null)
                    setNewFeaturedImage(null)
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <FileDropzone
              accept="image/*"
              description="Drag and drop an image here, or choose one from your computer."
              inputRef={featuredInputRef}
              label="Upload featured image"
              onChange={(files) => {
                beginEdit()
                setNewFeaturedImage(files[0] || null)
              }}
            />
          )}

          {newFeaturedImage ? (
            <div className="max-w-sm">
              <NewFileCard
                file={newFeaturedImage}
                onRemove={() => {
                  beginEdit()
                  setNewFeaturedImage(null)
                }}
              />
            </div>
          ) : null}
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Gallery"
        description="Upload, remove and reorder the photographs shown on the property listing."
      >
        <div className="space-y-5">
          {gallery.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleGalleryDragEnd}
            >
              <SortableContext
                items={gallery.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {gallery.map((item, index) => (
                    <SortableMediaCard
                      key={item.id}
                      index={index}
                      isLast={index === gallery.length - 1}
                      item={item}
                      onMoveBackward={() => {
                        beginEdit()
                        setGallery((current) => moveItem(current, index, Math.max(0, index - 1)))
                      }}
                      onMoveForward={() => {
                        beginEdit()
                        setGallery((current) =>
                          moveItem(current, index, Math.min(current.length - 1, index + 1)),
                        )
                      }}
                      onRemove={() => {
                        beginEdit()
                        setGallery((current) => current.filter((media) => media.id !== item.id))
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : null}

          {newGalleryFiles.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                Ready to upload
              </p>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {newGalleryFiles.map((file, index) => (
                  <NewFileCard
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    onRemove={() => {
                      beginEdit()
                      setNewGalleryFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <FileDropzone
            accept="image/*"
            description="Select multiple images. New images will be added after the existing gallery."
            inputRef={galleryInputRef}
            label="Add gallery images"
            multiple
            onChange={(files) => {
              beginEdit()
              setNewGalleryFiles((current) => [...current, ...files])
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Floorplans"
        description="Upload and order floorplans, site plans and layout images."
      >
        <div className="space-y-5">
          {floorPlans.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleFloorPlanDragEnd}
            >
              <SortableContext
                items={floorPlans.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {floorPlans.map((item, index) => (
                    <SortableMediaCard
                      key={item.id}
                      index={index}
                      isLast={index === floorPlans.length - 1}
                      item={item}
                      onMoveBackward={() => {
                        beginEdit()
                        setFloorPlans((current) => moveItem(current, index, Math.max(0, index - 1)))
                      }}
                      onMoveForward={() => {
                        beginEdit()
                        setFloorPlans((current) =>
                          moveItem(current, index, Math.min(current.length - 1, index + 1)),
                        )
                      }}
                      onRemove={() => {
                        beginEdit()
                        setFloorPlans((current) => current.filter((media) => media.id !== item.id))
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : null}

          {newFloorPlanFiles.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                Ready to upload
              </p>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {newFloorPlanFiles.map((file, index) => (
                  <NewFileCard
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    onRemove={() => {
                      beginEdit()
                      setNewFloorPlanFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <FileDropzone
            accept="image/*,.pdf"
            description="Upload floorplans or site plans. Image previews are displayed immediately."
            inputRef={floorPlanInputRef}
            label="Add floorplans"
            multiple
            onChange={(files) => {
              beginEdit()
              setNewFloorPlanFiles((current) => [...current, ...files])
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Video and virtual tour"
        description="Add externally hosted video and interactive tour URLs."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-900">
              YouTube video URL
            </span>

            <input
              className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              placeholder="https://www.youtube.com/watch?v=..."
              type="url"
              value={youtubeVideo}
              onChange={(event) => {
                beginEdit()
                setYoutubeVideo(event.target.value)
              }}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-900">
              Virtual tour URL
            </span>

            <input
              className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              placeholder="https://..."
              type="url"
              value={virtualTour}
              onChange={(event) => {
                beginEdit()
                setVirtualTour(event.target.value)
              }}
            />
          </label>
        </div>
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={error}
        isDirty={isDirty}
        isSaving={isSaving}
        message={message}
        onDiscard={discardChanges}
        onSave={saveMedia}
        saveLabel="Save media"
      />
    </div>
  )
}
