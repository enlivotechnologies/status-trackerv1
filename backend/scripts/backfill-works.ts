import { PrismaClient, WorkStatus, FollowUpStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillWorks() {
  console.log('Starting work items backfill...');

  try {
    // Get all leads that don't have pending works
    const leadsWithoutWorks = await prisma.lead.findMany({
      where: {
        works: {
          none: {
            status: WorkStatus.PENDING,
            completedAt: null
          }
        },
        // Only create works for leads that are not COMPLETED or NOT_NEGOTIABLE
        followUpStatus: {
          notIn: [FollowUpStatus.COMPLETED, FollowUpStatus.NOT_NEGOTIABLE]
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        followUpDate: true,
        assignedToId: true,
        followUpStatus: true
      }
    });

    console.log(`Found ${leadsWithoutWorks.length} leads without pending works`);

    let created = 0;
    let skipped = 0;

    for (const lead of leadsWithoutWorks) {
      // Skip if follow-up status is COMPLETED or NOT_NEGOTIABLE
      if (lead.followUpStatus === FollowUpStatus.COMPLETED || 
          lead.followUpStatus === FollowUpStatus.NOT_NEGOTIABLE) {
        skipped++;
        continue;
      }

      try {
        await prisma.work.create({
          data: {
            leadId: lead.id,
            title: `Follow up with ${lead.name}`,
            description: `Follow up call/meeting scheduled for ${lead.name} (${lead.phone})`,
            dueDate: lead.followUpDate,
            assignedToId: lead.assignedToId,
            status: WorkStatus.PENDING,
            completedAt: null
          }
        });
        created++;
        console.log(`Created work for lead: ${lead.name} (${lead.id})`);
      } catch (error) {
        console.error(`Failed to create work for lead ${lead.id}:`, error);
      }
    }

    console.log(`\nSummary:`);
    console.log(`   Created: ${created} work items`);
    console.log(`   Skipped: ${skipped} leads (COMPLETED/NOT_NEGOTIABLE)`);
    console.log(`\nBackfill completed!`);
  } catch (error) {
    console.error('Backfill failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillWorks()
  .catch((e) => {
    console.error('Backfill script failed:', e);
    process.exit(1);
  });
