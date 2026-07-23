import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import { APIError } from 'payload'

import { createTaskActivities } from '@/lib/activity/createTaskActivities'
import type { Task } from '@/payload-types'

type PayloadUser = {
  collection: 'users'
  id: string
  role?: string | null
  agency?: string | { id: string } | null
}

const isPayloadUser = (user: unknown): user is PayloadUser => {
  return (
    typeof user === 'object' && user !== null && 'collection' in user && user.collection === 'users'
  )
}

const getRelationshipId = (value: unknown): string | undefined => {
  if (!value) return undefined

  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String(value.id)
  }

  return String(value)
}

const getUserAgencyId = (user: unknown): string | undefined => {
  if (!isPayloadUser(user) || !user.agency) {
    return undefined
  }

  return getRelationshipId(user.agency)
}

const isSuperAdmin = ({ req }: any): boolean => {
  return isPayloadUser(req.user) && req.user.role === 'super-admin'
}

const agencyOnly = ({ req }: any) => {
  if (!isPayloadUser(req.user)) {
    return false
  }

  if (req.user.role === 'super-admin') {
    return true
  }

  const agencyId = getUserAgencyId(req.user)

  if (!agencyId) {
    return false
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}

const agencyUserOnly = ({ req }: any): boolean => {
  if (!isPayloadUser(req.user)) {
    return false
  }

  return req.user.role === 'super-admin' || Boolean(getUserAgencyId(req.user))
}

const setTaskOwnership: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data
  }

  const user = req.user

  if (!isPayloadUser(user)) {
    return data
  }

  if (operation === 'create') {
    if (!data.createdBy) {
      data.createdBy = user.id
    }

    if (!data.agency) {
      const agencyId = getUserAgencyId(user)

      if (agencyId) {
        data.agency = agencyId
      }
    }
  }

  if (user.role !== 'super-admin') {
    const userAgencyId = getUserAgencyId(user)
    const taskAgencyId = getRelationshipId(data.agency) || getRelationshipId(originalDoc?.agency)

    if (!userAgencyId) {
      throw new APIError('Your account is not connected to an agency.', 403)
    }

    if (taskAgencyId && taskAgencyId !== userAgencyId) {
      throw new APIError('You cannot create or update tasks for another agency.', 403)
    }

    data.agency = userAgencyId
  }

  return data
}

const validateTaskRelationships: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (!data) {
    return data
  }

  const relationshipFields = ['property', 'lead', 'enquiry', 'viewing', 'buyer'] as const

  const populatedRelationships = relationshipFields.filter((field) => {
    const currentValue = data[field] !== undefined ? data[field] : originalDoc?.[field]

    return Boolean(getRelationshipId(currentValue))
  })

  if (populatedRelationships.length > 1) {
    throw new APIError(
      'A task can only be linked to one property, lead, enquiry, viewing, or buyer.',
      400,
    )
  }

  return data
}

const setCompletionDate: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (!data) {
    return data
  }

  const previousStatus = originalDoc?.status
  const nextStatus = data.status ?? previousStatus

  if (nextStatus === 'completed' && previousStatus !== 'completed') {
    data.completedAt = data.completedAt || new Date().toISOString()
  }

  if (
    previousStatus === 'completed' &&
    nextStatus !== 'completed' &&
    data.completedAt === undefined
  ) {
    data.completedAt = null
  }

  return data
}

const taskActivityFields = [
  'title',
  'description',
  'status',
  'priority',
  'dueAt',
  'reminderAt',
  'assignedAgent',
  'property',
  'lead',
  'enquiry',
  'viewing',
  'buyer',
  'checklist',
  'internalNotes',
] as const

function normaliseActivityValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normaliseActivityValue)
  }

  if (typeof value === 'object' && value !== null) {
    if ('id' in value) {
      return String(value.id)
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normaliseActivityValue(nestedValue)]),
    )
  }

  return value
}

function getTaskChangedFields(
  previousTask: Record<string, unknown>,
  task: Record<string, unknown>,
): string[] {
  return taskActivityFields.filter((field) => {
    const previousValue = normaliseActivityValue(previousTask[field])
    const nextValue = normaliseActivityValue(task[field])

    return JSON.stringify(previousValue) !== JSON.stringify(nextValue)
  })
}

const createTaskActivityRecords: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (!isPayloadUser(req.user)) {
    return doc
  }

  const agencyId = getRelationshipId(doc.agency)

  if (!agencyId) {
    return doc
  }

  const task = doc as Task

  const changedFields =
    operation === 'create'
      ? []
      : getTaskChangedFields(
          (previousDoc || {}) as Record<string, unknown>,
          doc as Record<string, unknown>,
        )

  try {
    await createTaskActivities({
      previousTask: operation === 'update' && previousDoc ? (previousDoc as Task) : null,
      task,
      changedFields,
      agencyId,
      userId: req.user.id,
      operation,
    })
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Failed to create activity records for task ${String(doc.id)}.`,
    })
  }

  return doc
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'priority', 'assignedAgent', 'dueAt', 'agency'],
    group: 'CRM',
  },

  access: {
    read: agencyOnly,
    create: agencyUserOnly,
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeChange: [setTaskOwnership, validateTaskRelationships, setCompletionDate],
    afterChange: [createTaskActivityRecords],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 160,
    },
    {
      name: 'description',
      type: 'textarea',
    },

    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'todo',
          options: [
            {
              label: 'To Do',
              value: 'todo',
            },
            {
              label: 'In Progress',
              value: 'in-progress',
            },
            {
              label: 'Waiting',
              value: 'waiting',
            },
            {
              label: 'Completed',
              value: 'completed',
            },
            {
              label: 'Cancelled',
              value: 'cancelled',
            },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'priority',
          type: 'select',
          required: true,
          defaultValue: 'normal',
          options: [
            {
              label: 'Low',
              value: 'low',
            },
            {
              label: 'Normal',
              value: 'normal',
            },
            {
              label: 'High',
              value: 'high',
            },
            {
              label: 'Urgent',
              value: 'urgent',
            },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'dueAt',
          label: 'Due Date',
          type: 'date',
          admin: {
            width: '33%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'reminderAt',
          label: 'Reminder Date',
          type: 'date',
          admin: {
            width: '33%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'completedAt',
          label: 'Completed Date',
          type: 'date',
          admin: {
            width: '33%',
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Assignment',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'agency',
              type: 'relationship',
              relationTo: 'agencies',
              required: true,
              defaultValue: ({ user }) => getUserAgencyId(user),
              admin: {
                width: '33%',
                condition: (_, __, { user }) => {
                  return isPayloadUser(user) && user.role === 'super-admin'
                },
              },
            },
            {
              name: 'assignedAgent',
              label: 'Assigned Agent',
              type: 'relationship',
              relationTo: 'agents',
              admin: {
                width: '33%',
              },
            },
            {
              name: 'createdBy',
              label: 'Created By',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                width: '33%',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Related Record',
      admin: {
        description: 'A task can be linked to one property, lead, enquiry, viewing, or buyer.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'property',
              type: 'relationship',
              relationTo: 'properties',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'lead',
              label: 'Valuation Lead',
              type: 'relationship',
              relationTo: 'valuation-leads',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'enquiry',
              type: 'relationship',
              relationTo: 'enquiries',
              admin: {
                width: '33%',
              },
            },
            {
              name: 'viewing',
              type: 'relationship',
              relationTo: 'viewings',
              admin: {
                width: '33%',
              },
            },
            {
              name: 'buyer',
              type: 'relationship',
              relationTo: 'buyers',
              admin: {
                width: '33%',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'checklist',
      type: 'array',
      labels: {
        singular: 'Checklist Item',
        plural: 'Checklist',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                width: '75%',
              },
            },
            {
              name: 'completed',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '25%',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'internalNotes',
      label: 'Internal Notes',
      type: 'textarea',
    },
  ],
}
