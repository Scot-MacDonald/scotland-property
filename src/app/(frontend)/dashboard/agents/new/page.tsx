import { AgentCreateForm } from '@/components/AgentCreateForm'
import Link from 'next/link'

export default function NewAgentPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <Link href="/dashboard/agents" className="text-sm text-gray-500 hover:text-black">
          ← Back to agents
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">Add agent</h1>

        <p className="mt-2 text-gray-600">
          Add a team member who can be assigned to listings and enquiries.
        </p>
      </div>

      <AgentCreateForm />
    </main>
  )
}
