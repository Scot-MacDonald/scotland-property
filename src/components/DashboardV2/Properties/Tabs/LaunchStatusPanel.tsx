import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

export type LaunchReadinessItem = {
  label: string
  complete: boolean
  requiredForLaunch?: boolean
}

type LaunchStatusPanelProps = {
  readinessItems: LaunchReadinessItem[]
  readinessPercentage: number
}

type LaunchStatus = 'not-ready' | 'nearly-ready' | 'ready'

function getLaunchStatus(items: LaunchReadinessItem[]): LaunchStatus {
  const missingRequiredItems = items.filter((item) => item.requiredForLaunch && !item.complete)

  if (missingRequiredItems.length > 0) {
    return 'not-ready'
  }

  const missingItems = items.filter((item) => !item.complete)

  if (missingItems.length > 0) {
    return 'nearly-ready'
  }

  return 'ready'
}

function getStatusContent(status: LaunchStatus) {
  switch (status) {
    case 'ready':
      return {
        label: 'Ready to publish',
        description:
          'All launch and marketing checks are complete. This property is ready for publication.',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        dotClassName: 'bg-emerald-600',
      }

    case 'nearly-ready':
      return {
        label: 'Nearly ready',
        description:
          'The core listing is complete, but some marketing improvements are still recommended.',
        badgeClassName: 'border-amber-200 bg-amber-50 text-amber-800',
        dotClassName: 'bg-amber-500',
      }

    case 'not-ready':
      return {
        label: 'Not ready',
        description:
          'Essential listing information is missing and should be completed before publication.',
        badgeClassName: 'border-red-200 bg-red-50 text-red-800',
        dotClassName: 'bg-red-600',
      }
  }
}

export function LaunchStatusPanel({ readinessItems, readinessPercentage }: LaunchStatusPanelProps) {
  const status = getLaunchStatus(readinessItems)
  const statusContent = getStatusContent(status)

  const missingRequiredItems = readinessItems.filter(
    (item) => item.requiredForLaunch && !item.complete,
  )

  const missingRecommendedItems = readinessItems.filter(
    (item) => !item.requiredForLaunch && !item.complete,
  )

  const completedItems = readinessItems.filter((item) => item.complete)

  return (
    <WorkspacePanel
      title="Launch status"
      description="See whether this property has everything needed for publication."
    >
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div
            className={[
              'inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold',
              statusContent.badgeClassName,
            ].join(' ')}
          >
            <span className={['h-2 w-2 rounded-full', statusContent.dotClassName].join(' ')} />

            {statusContent.label}
          </div>

          <p className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950">
            {readinessPercentage}%
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">{statusContent.description}</p>

          <div className="mt-5 h-2 overflow-hidden bg-neutral-200">
            <div
              className="h-full bg-neutral-950 transition-all"
              style={{
                width: `${readinessPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Needs attention
            </h3>

            {missingRequiredItems.length === 0 && missingRecommendedItems.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                There are no outstanding launch checks.
              </p>
            ) : (
              <div className="mt-3 space-y-5">
                {missingRequiredItems.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-red-700">Required before launch</p>

                    <ul className="mt-2 space-y-2">
                      {missingRequiredItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-3 text-sm text-neutral-700"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {missingRecommendedItems.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Recommended improvements</p>

                    <ul className="mt-2 space-y-2">
                      {missingRecommendedItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-3 text-sm text-neutral-700"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Completed
            </h3>

            <p className="mt-4 text-sm text-neutral-600">
              {completedItems.length} of {readinessItems.length} checks complete
            </p>

            <ul className="mt-3 space-y-2">
              {completedItems.slice(0, 6).map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-emerald-700 text-xs text-white">
                    ✓
                  </span>

                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            {completedItems.length > 6 ? (
              <p className="mt-3 text-xs text-neutral-500">
                +{completedItems.length - 6} more completed
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </WorkspacePanel>
  )
}
