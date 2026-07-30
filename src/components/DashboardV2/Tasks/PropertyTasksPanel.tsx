import Link from 'next/link'
import { NewTaskModal } from './NewTaskModal'

type PropertyTask = {
  id: string
  title: string
  status?: 'todo' | 'in-progress' | 'waiting' | 'completed' | 'cancelled' | null
  priority?: 'low' | 'normal' | 'high' | 'urgent' | null
  dueAt?: string | null
  assignedAgent?: string | null
}

type AgentOption = {
  value: string
  label: string
}

type PropertyTasksPanelProps = {
  propertyId: string
  propertyTitle: string
  tasks: PropertyTask[]
  agents: AgentOption[]
}

function formatTaskDate(value?: string | null) {
  if (!value) return null

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getPriorityClasses(priority?: PropertyTask['priority']) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'low':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function formatPriority(priority?: PropertyTask['priority']) {
  if (!priority) return 'Normal'

  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function isCompleted(task: PropertyTask) {
  return task.status === 'completed' || task.status === 'cancelled'
}

export function PropertyTasksPanel({
  propertyId,
  propertyTitle,
  tasks,
  agents,
}: PropertyTasksPanelProps) {
  const openTasks = tasks.filter((task) => !isCompleted(task))
  const completedTasks = tasks.filter((task) => isCompleted(task))

  return (
    <aside className="overflow-hidden border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-neutral-900">Tasks</h2>

          <p className="mt-1 text-xs text-neutral-500">
            {openTasks.length} open {openTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <Link
          href={`/dashboard/tasks?property=${propertyId}`}
          className="text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:text-neutral-950"
        >
          View all
        </Link>
      </div>

      {openTasks.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {openTasks.slice(0, 5).map((task) => {
            const dueDate = formatTaskDate(task.dueAt)

            return (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="block px-5 py-4 transition hover:bg-neutral-50"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 border border-neutral-400 bg-white" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{task.title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          'inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          getPriorityClasses(task.priority),
                        ].join(' ')}
                      >
                        {formatPriority(task.priority)}
                      </span>

                      {dueDate ? (
                        <span className="text-xs text-neutral-500">Due {dueDate}</span>
                      ) : null}

                      {task.assignedAgent ? (
                        <span className="text-xs text-neutral-500">{task.assignedAgent}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium text-neutral-900">No open tasks</p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            This property currently has no outstanding work.
          </p>
        </div>
      )}

      <div className="border-t border-neutral-200 p-4">
        <NewTaskModal
          relationshipType="property"
          relationshipId={propertyId}
          relationshipTitle={propertyTitle}
          agents={agents}
        />

        {completedTasks.length > 0 ? (
          <p className="mt-3 text-center text-xs text-neutral-500">
            {completedTasks.length} completed
          </p>
        ) : null}
      </div>
    </aside>
  )
}
