import { NextResponse } from 'next/server'

type WorkspaceErrorOptions = {
  fallback?: string
  status?: number
}

export function workspaceError(
  error: unknown,
  { fallback = 'Something went wrong.', status = 500 }: WorkspaceErrorOptions = {},
) {
  const message = error instanceof Error ? error.message : fallback

  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  )
}
