'use client'

type Props = {
  propertyId: string
}

export function RemoveSavedButton({ propertyId }: Props) {
  function removeProperty(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const savedProperties: string[] = JSON.parse(localStorage.getItem('savedProperties') || '[]')

    const nextSavedProperties = savedProperties.filter((id) => id !== propertyId)

    localStorage.setItem('savedProperties', JSON.stringify(nextSavedProperties))

    window.location.reload()
  }

  return (
    <button type="button" onClick={removeProperty} className="border px-4 py-2 text-sm">
      Remove
    </button>
  )
}
