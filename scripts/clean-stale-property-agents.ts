import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({
  config: configPromise,
})

const [agents, properties] = await Promise.all([
  payload.find({
    collection: 'agents',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  }),
  payload.find({
    collection: 'properties',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  }),
])

const validAgentIds = new Set(agents.docs.map((agent) => String(agent.id)))

console.log('\n=== CHECKING PROPERTY AGENTS ===')

let cleared = 0

for (const property of properties.docs) {
  const agentId =
    typeof property.agent === 'object' && property.agent
      ? String(property.agent.id)
      : property.agent
        ? String(property.agent)
        : ''

  if (!agentId) {
    console.log(`✓ No agent: ${property.title}`)
    continue
  }

  if (validAgentIds.has(agentId)) {
    console.log(`✓ Valid agent: ${property.title}`)
    continue
  }

  console.log(`! Stale agent on "${property.title}": ${agentId}`)
  console.log('  Clearing stale relationship...')

  await payload.update({
    collection: 'properties',
    id: property.id,
    overrideAccess: true,
    data: {
      agent: null,
    },
  })

  cleared++
}

console.log('\n=== COMPLETE ===')
console.log({
  propertiesChecked: properties.totalDocs,
  validAgents: agents.totalDocs,
  staleAgentsCleared: cleared,
})

process.exit(0)
