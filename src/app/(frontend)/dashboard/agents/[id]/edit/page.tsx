import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import AgentEditForm from '@/components/AgentEditForm'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditAgentPage({ params }: Props) {
  const { id } = await params

  const payload = await getPayload({
    config: configPromise,
  })

  const agent = await payload.findByID({
    collection: 'agents',
    id,
    depth: 2,
    overrideAccess: true,
  })

  if (!agent) {
    return notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <a href="/dashboard/agents" className="text-sm text-gray-500 hover:text-black">
          ← Back to agents
        </a>

        <h1 className="mt-4 text-3xl font-semibold">Edit agent</h1>

        <p className="mt-2 text-gray-600">Update your team member details.</p>
      </div>

      <AgentEditForm agent={agent} />
    </main>
  )
}
