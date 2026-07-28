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
        label: 'Ready for publication',
        description:
          'All required listing and marketing checks are complete. This property is ready to be published.',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        dotClassName: 'bg-emerald-600',
        progressClassName: 'bg-emerald-700',
      }

    case 'nearly-ready':
      return {
        label: 'Almost ready',
        description:
          'The property can be published, but a few recommended marketing improvements remain.',
        badgeClassName: 'border-amber-200 bg-amber-50 text-amber-800',
        dotClassName: 'bg-amber-500',
        progressClassName: 'bg-amber-500',
      }

    case 'not-ready':
      return {
        label: 'Action required',
        description:
          'Essential listing information is missing and should be completed before publication.',
        badgeClassName: 'border-red-200 bg-red-50 text-red-800',
        dotClassName: 'bg-red-600',
        progressClassName: 'bg-red-600',
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
  const missingItemCount = missingRequiredItems.length + missingRecommendedItems.length

  return (
    <WorkspacePanel
      title="Marketing readiness"
      description="Review the listing checks that determine whether this property is ready for publication."
    >
      <div className="space-y-8">
        <div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div
                className={[
                  'inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold',
                  statusContent.badgeClassName,
                ].join(' ')}
              >
                <span className={['h-2 w-2 rounded-full', statusContent.dotClassName].join(' ')} />

                {statusContent.label}
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-600">{statusContent.description}</p>
            </div>

            <div className="shrink-0 lg:text-right">
              <p className="text-4xl font-semibold tracking-tight text-neutral-950">
                {readinessPercentage}%
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                {completedItems.length} of {readinessItems.length} checks complete
              </p>
            </div>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden bg-neutral-200">
            <div
              className={[
                'h-full transition-all duration-300',
                statusContent.progressClassName,
              ].join(' ')}
              style={{
                width: `${readinessPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid gap-8 border-t border-neutral-200 pt-8 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Action required
              </h3>

              {missingItemCount > 0 ? (
                <span className="text-xs font-medium text-neutral-500">
                  {missingItemCount} outstanding
                </span>
              ) : null}
            </div>

            {missingItemCount === 0 ? (
              <div className="mt-4 border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-emerald-700 text-xs font-semibold text-white">
                    ✓
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-emerald-900">No issues detected</p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      Every required and recommended marketing check is complete.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {missingRequiredItems.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-red-700">
                      Required before publication
                    </p>

                    <ul className="mt-3 space-y-2">
                      {missingRequiredItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-3 border border-red-100 bg-red-50 px-4 py-3 text-sm text-neutral-800"
                        >
                          <span className="mt-0.5 font-semibold text-red-700">!</span>
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {missingRecommendedItems.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Recommended improvements</p>

                    <ul className="mt-3 space-y-2">
                      {missingRecommendedItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-3 border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-neutral-800"
                        >
                          <span className="mt-0.5 font-semibold text-amber-700">!</span>
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Ready
              </h3>

              <span className="text-xs font-medium text-neutral-500">
                {completedItems.length} complete
              </span>
            </div>

            {completedItems.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {completedItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                  >
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-emerald-700 text-xs font-semibold text-white">
                      ✓
                    </span>

                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                No readiness checks have been completed yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </WorkspacePanel>
  )
}
