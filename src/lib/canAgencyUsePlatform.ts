export function canAgencyUsePlatform(agency: any) {
  if (!agency) return false

  if (agency.subscriptionStatus === 'active') return true

  if (agency.subscriptionStatus === 'trial') {
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

  if (agency.subscriptionStatus === 'trial' && agency.trialEndsAt) {
    const trialExpired = new Date(agency.trialEndsAt) <= new Date()

    if (trialExpired) {
      return 'Your trial has expired. Please upgrade to continue using the platform.'
    }
  }

  return 'Your agency subscription is not active.'
}
