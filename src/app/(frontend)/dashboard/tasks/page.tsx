import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardTaskCard } from '@/components/DashboardV2/Cards/DashboardTaskCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
import {
  getDashboardTasks,
  type DashboardTaskDueFilter,
  type DashboardTaskRelatedEntityType,
} from '@/lib/dashboard/getDashboardTasks'

type TaskSearchParams = {
  q?: string
  status?: string
  priority?: string
  due?: string
  page?: string
}

function formatTaskDate(value: string | null) {
  if (!value) {
    return 'No due date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getTaskDueState({
  dueAt,
  status,
}: {
  dueAt: string | null
  status: string
}): 'overdue' | 'today' | 'upcoming' | 'none' | 'completed' {
  if (status === 'completed') {
    return 'completed'
  }

  if (!dueAt) {
    return 'none'
  }

  const dueDate = new Date(dueAt)

  if (Number.isNaN(dueDate.getTime())) {
    return 'none'
  }

  const now = new Date()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  if (dueDate.getTime() < now.getTime()) {
    return 'overdue'
  }

  if (
    dueDate.getTime() >= startOfToday.getTime() &&
    dueDate.getTime() < startOfTomorrow.getTime()
  ) {
    return 'today'
  }

  return 'upcoming'
}

function getRelatedEntityHref(
  type: DashboardTaskRelatedEntityType | null,
  id: string | null,
): string | null {
  if (!type || !id) {
    return null
  }

  switch (type) {
    case 'property':
      return `/dashboard/properties/${id}`

    case 'lead':
      return `/dashboard/leads/${id}`

    case 'enquiry':
      return `/dashboard/enquiries/${id}`

    case 'viewing':
      return `/dashboard/viewings/${id}`

    case 'buyer':
      return `/dashboard/buyers/${id}`

    default:
      return null
  }
}

function normaliseDueFilter(value: string): DashboardTaskDueFilter {
  if (value === 'overdue' || value === 'today' || value === 'upcoming' || value === 'no-date') {
    return value
  }

  return ''
}

function createPageHref({
  query,
  status,
  priority,
  due,
  page,
}: {
  query: string
  status: string
  priority: string
  due: string
  page: number
}) {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (status) params.set('status', status)
  if (priority) params.set('priority', priority)
  if (due) params.set('due', due)
  if (page > 1) params.set('page', String(page))

  const search = params.toString()

  return search ? `/dashboard/tasks?${search}` : '/dashboard/tasks'
}

export default async function DashboardTasksPage({
  searchParams,
}: {
  searchParams: Promise<TaskSearchParams>
}) {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const {
    q = '',
    status = '',
    priority = '',
    due: dueValue = '',
    page: pageValue = '1',
  } = await searchParams

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any

  const parsedPage = Number.parseInt(pageValue, 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const due = normaliseDueFilter(dueValue)

  const [dashboard, tasks] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardTasks({
      payload,
      user: dashboardUser,
      limit: 12,
      page,
      query: q.trim(),
      status,
      priority,
      due,
    }),
  ])

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  const filtersActive = Boolean(q || status || priority || due)

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Work Management"
        title="Tasks"
        description={`${tasks.totalDocs} ${tasks.totalDocs === 1 ? 'task' : 'tasks'} found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <form
          method="GET"
          className="mb-8 grid gap-3 border border-black/10 bg-white p-4 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(160px,auto))_auto_auto]"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search tasks..."
            className="min-h-11 border border-black/10 px-4 text-sm outline-none focus:border-black"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            name="priority"
            defaultValue={priority}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            name="due"
            defaultValue={due}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">Any due date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="upcoming">Upcoming</option>
            <option value="no-date">No due date</option>
          </select>

          <button
            type="submit"
            className="min-h-11 bg-black px-6 text-sm uppercase tracking-[0.16em] text-white"
          >
            Filter
          </button>

          {filtersActive ? (
            <Link
              href="/dashboard/tasks"
              className="inline-flex min-h-11 items-center justify-center border border-black/10 px-5 text-sm uppercase tracking-[0.16em]"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <DashboardCollection
          empty={tasks.docs.length === 0}
          emptyTitle="No tasks found"
          emptyDescription={
            filtersActive
              ? 'Try changing your search terms or filters.'
              : 'Tasks assigned to your agency will appear here.'
          }
          showPagination={false}
        >
          <div className="space-y-4">
            {tasks.docs.map((task) => (
              <DashboardTaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                status={task.status}
                priority={task.priority}
                dueDate={formatTaskDate(task.dueAt)}
                dueState={getTaskDueState({
                  dueAt: task.dueAt,
                  status: task.status,
                })}
                assignedAgent={task.assignedAgentName}
                relatedEntityType={task.relatedEntityType}
                relatedEntityTitle={task.relatedEntityTitle}
                relatedEntityHref={getRelatedEntityHref(
                  task.relatedEntityType,
                  task.relatedEntityId,
                )}
                checklistCompleted={task.checklistCompleted}
                checklistTotal={task.checklistTotal}
                href={`/dashboard/tasks/${task.id}`}
              />
            ))}
          </div>
        </DashboardCollection>

        {tasks.totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <p className="text-sm text-black/50">
              Page {tasks.page} of {tasks.totalPages}
            </p>

            <div className="flex gap-2">
              {tasks.hasPrevPage ? (
                <Link
                  href={createPageHref({
                    query: q,
                    status,
                    priority,
                    due,
                    page: tasks.page - 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Previous
                </Link>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">
                  Previous
                </span>
              )}

              {tasks.hasNextPage ? (
                <Link
                  href={createPageHref({
                    query: q,
                    status,
                    priority,
                    due,
                    page: tasks.page + 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Next
                </Link>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">Next</span>
              )}
            </div>
          </nav>
        ) : null}
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
