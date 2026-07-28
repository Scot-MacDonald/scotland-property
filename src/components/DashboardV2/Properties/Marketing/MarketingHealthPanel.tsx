import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

type MarketingHealthPanelProps = {
  seoTitle?: string | null
  seoDescription?: string | null
  featuredImage?: unknown
  socialImage?: unknown
  brochure?: unknown
  publishOnWebsite?: boolean
}

export function MarketingHealthPanel({
  seoTitle,
  seoDescription,
  featuredImage,
  socialImage,
  brochure,
  publishOnWebsite,
}: MarketingHealthPanelProps) {
  const checks = [
    {
      label: 'SEO title',
      passed: Boolean(seoTitle?.trim()),
    },
    {
      label: 'SEO description',
      passed: Boolean(seoDescription?.trim()),
    },
    {
      label: 'Featured image',
      passed: Boolean(featuredImage),
    },
    {
      label: 'Social image',
      passed: Boolean(socialImage),
    },
    {
      label: 'Brochure',
      passed: Boolean(brochure),
    },
    {
      label: 'Website publishing',
      passed: Boolean(publishOnWebsite),
    },
  ]

  const passed = checks.filter((c) => c.passed)
  const failed = checks.filter((c) => !c.passed)

  const score = Math.round((passed.length / checks.length) * 100)

  return (
    <WorkspacePanel
      title="Marketing Health"
      description="A quick overview of your listing's marketing quality."
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Overall score</p>

              <p className="mt-2 text-4xl font-semibold text-neutral-950">{score}%</p>
            </div>

            <p className="text-sm text-neutral-500">
              {passed.length} / {checks.length} checks
            </p>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden bg-neutral-200">
            <div
              className="h-full bg-neutral-950 transition-all"
              style={{
                width: `${score}%`,
              }}
            />
          </div>
        </div>

        {failed.length > 0 ? (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Needs attention
            </h3>

            <ul className="mt-3 space-y-2">
              {failed.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 border border-amber-100 bg-amber-50 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-amber-700">!</span>

                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border border-emerald-200 bg-emerald-50 px-4 py-4">
            <p className="font-medium text-emerald-900">No issues detected</p>

            <p className="mt-1 text-sm text-emerald-800">Your listing is ready for marketing.</p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Completed
          </h3>

          <ul className="mt-3 space-y-2">
            {passed.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="inline-flex h-5 w-5 items-center justify-center bg-emerald-700 text-xs text-white">
                  ✓
                </span>

                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkspacePanel>
  )
}
