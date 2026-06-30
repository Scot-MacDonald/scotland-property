export function canAgencyUsePlatform(agency: any) {
  if (!agency) return false

  if (agency.subscriptionStatus === 'active') return true

  if (agency.subscriptionStatus === 'trial') {
    // No trial date set = allow access for safety
    if (!agency.trialEndsAt) return true

    return new Date(agency.trialEndsAt) > new Date()
  }

  return false
}

export function getAgencySubscriptionBlockReason(agency: any) {
  if (!agency) return 'Agency not found.'

  if (agency.subscriptionStatus === 'cancelled') {
    return 'Your subscription has been cancelled. Please upgrade to continue using the platform.'
  }

  if (agency.subscriptionStatus === 'past-due') {
    return 'Your subscription payment is past due. Please update your billing details.'
  }

  if (agency.subscriptionStatus === 'trial') {
    if (!agency.trialEndsAt) return null

    if (new Date(agency.trialEndsAt) <= new Date()) {
      return 'Your free trial has expired. Please upgrade to continue using the platform.'
    }

    return null
  }

  if (agency.subscriptionStatus === 'active') {
    return null
  }

  return 'Your agency subscription is not active.'
}
