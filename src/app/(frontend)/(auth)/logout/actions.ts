'use server'

import configPromise from '@payload-config'
import { logout } from '@payloadcms/next/auth'

export async function logoutAction() {
  try {
    await logout({
      config: configPromise,
      allSessions: false,
    })

    return {
      success: true,
    }
  } catch {
    return {
      success: false,
      message: 'Unable to sign out. Please try again.',
    }
  }
}
