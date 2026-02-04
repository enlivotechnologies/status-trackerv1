const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for sample agents...\n');
  
  // Find sample agents
  const sampleAgents = await prisma.user.findMany({
    where: {
      role: 'AGENT',
      OR: [
        { email: 'agent@realestate.com' },
        { email: 'agent2@realestate.com' }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  if (sampleAgents.length === 0) {
    console.log('No sample agents found.');
    return;
  }

  console.log('Found sample agents:');
  sampleAgents.forEach(agent => {
    console.log('  - ' + agent.name + ' (' + agent.email + ')');
  });

  const agentIds = sampleAgents.map(a => a.id);

  // Delete related data first
  console.log('\nDeleting related data...');

  // Delete notes for leads owned by sample agents
  const leadsToDelete = await prisma.lead.findMany({
    where: { assignedToId: { in: agentIds } },
    select: { id: true }
  });
  const leadIds = leadsToDelete.map(l => l.id);

  if (leadIds.length > 0) {
    // Delete notes
    const deletedNotes = await prisma.note.deleteMany({
      where: { leadId: { in: leadIds } }
    });
    console.log('  Deleted ' + deletedNotes.count + ' notes');

    // Delete activity logs
    const deletedLogs = await prisma.activityLog.deleteMany({
      where: { leadId: { in: leadIds } }
    });
    console.log('  Deleted ' + deletedLogs.count + ' activity logs');

    // Delete works
    const deletedWorks = await prisma.work.deleteMany({
      where: { leadId: { in: leadIds } }
    });
    console.log('  Deleted ' + deletedWorks.count + ' works');
  }

  // Delete leads
  const deletedLeads = await prisma.lead.deleteMany({
    where: { assignedToId: { in: agentIds } }
  });
  console.log('  Deleted ' + deletedLeads.count + ' leads');

  // Delete daily pending work counts if exists
  try {
    const deletedCounts = await prisma.dailyPendingWorkCount.deleteMany({
      where: { agentId: { in: agentIds } }
    });
    console.log('  Deleted ' + deletedCounts.count + ' daily pending work counts');
  } catch (e) {
    console.log('  No daily pending work counts table found (skipping)');
  }

  // Delete sample agents
  const deletedAgents = await prisma.user.deleteMany({
    where: { id: { in: agentIds } }
  });
  console.log('\nDeleted ' + deletedAgents.count + ' sample agents.');
  
  console.log('\nSample agents removed successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
