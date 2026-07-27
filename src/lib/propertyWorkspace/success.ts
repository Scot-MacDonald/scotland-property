import { NextResponse } from 'next/server'

export function workspaceSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    { status },
  )
}
