import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  const now = new Date().toISOString()

  const leads = await payload.find({
    collection: 'valuation-leads',
    depth: 1,
    limit: 500,
    where: {
      and: [
        {
          nextFollowUpAt: {
            less_than_equal: now,
          },
        },
        {
          followUpCompleted: {
            not_equals: true,
          },
        },
        {
          assignedAgency: {
            exists: true,
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const leadsByAgency = new Map<string, any[]>()

  for (const lead of leads.docs as any[]) {
    const agencyId =
      typeof lead.assignedAgency === 'object' ? lead.assignedAgency.id : lead.assignedAgency

    if (!agencyId) continue

    if (!leadsByAgency.has(agencyId)) {
      leadsByAgency.set(agencyId, [])
    }

    leadsByAgency.get(agencyId)?.push(lead)
  }

  let emailsSent = 0

  for (const [agencyId, agencyLeads] of leadsByAgency.entries()) {
    const agency = await payload.findByID({
      collection: 'agencies',
      id: agencyId,
      overrideAccess: true,
    })

    if (!agency?.email) continue

    const itemsHtml = agencyLeads
      .map((lead) => {
        return `
          <li style="margin-bottom: 12px;">
            <strong>${lead.name}</strong><br />
            ${lead.postcode ? `Postcode: ${lead.postcode}<br />` : ''}
            ${lead.nextFollowUpTask ? `Task: ${lead.nextFollowUpTask}<br />` : ''}
            ${lead.nextFollowUpAt ? `Due: ${formatDate(lead.nextFollowUpAt)}<br />` : ''}
          </li>
        `
      })
      .join('')

    await payload.sendEmail({
      to: agency.email,
      subject: `Follow-up reminder: ${agencyLeads.length} task${
        agencyLeads.length === 1 ? '' : 's'
      } due`,
      html: `
        <h2>Follow-up reminders</h2>

        <p>
          You have ${agencyLeads.length} valuation follow-up task${
            agencyLeads.length === 1 ? '' : 's'
          } due.
        </p>

        <ul>
          ${itemsHtml}
        </ul>

        <p>
          Please log in to the dashboard to update your leads.
        </p>
      `,
    })

    emailsSent++
  }

  return NextResponse.json({
    ok: true,
    leadsFound: leads.totalDocs,
    agenciesFound: leadsByAgency.size,
    emailsSent,
  })
}
