'use server'

import configPromise from '@payload-config'
import { login } from '@payloadcms/next/auth'

export type LoginActionResult =
  | {
      success: true
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
    await login({
      collection: 'buyers',
      config: configPromise,
      email: cleanEmail,
      password,
    })

    return {
      success: true,
    }
  } catch {
    return {
      success: false,
      message: 'The email address or password is incorrect.',
    }
  }
}
