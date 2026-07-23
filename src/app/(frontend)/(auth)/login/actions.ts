'use server'

import configPromise from '@payload-config'
import { login } from '@payloadcms/next/auth'

export type LoginActionResult =
  | {
      success: true
      role: string | null
    }
  | {
      success: false
      message: string
    }

export async function loginAction({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<LoginActionResult> {
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanEmail || !password) {
    return {
      success: false,
      message: 'Please enter your email address and password.',
    }
  }

  try {
    const result = await login({
      collection: 'users',
      config: configPromise,
      email: cleanEmail,
      password,
    })

    const user = result.user as {
      role?: string | null
    }

    return {
      success: true,
      role: user.role || null,
    }
  } catch {
    return {
      success: false,
      message: 'The email address or password is incorrect.',
    }
  }
}
