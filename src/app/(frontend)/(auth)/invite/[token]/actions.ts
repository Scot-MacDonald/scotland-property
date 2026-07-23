'use server'

import configPromise from '@payload-config'
import { login } from '@payloadcms/next/auth'
import { getPayload } from 'payload'

import { acceptInvitation } from '@/lib/invitations'

export type AcceptInvitationActionResult =
  | {
      success: true
      message: string
    }
  | {
      success: false
      message: string
    }

export async function acceptInvitationAction({
  token,
  password,
  confirmPassword,
}: {
  token: string
  password: string
  confirmPassword: string
}): Promise<AcceptInvitationActionResult> {
  if (!password || !confirmPassword) {
    return {
      success: false,
      message: 'Please enter and confirm your password.',
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: 'The passwords do not match.',
    }
  }

  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await acceptInvitation({
      payload,
      token,
      password,
    })

    if (!result.success) {
      return result
    }

    await login({
      collection: 'users',
      config: configPromise,
      email: result.email,
      password,
    })

    return {
      success: true,
      message: 'Your account has been created.',
    }
  } catch (error) {
    console.error('Accept invitation error:', error)

    return {
      success: false,
      message: 'Unable to create your account. Please try again.',
    }
  }
}
