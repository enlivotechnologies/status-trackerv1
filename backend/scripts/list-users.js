const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  
  console.log('All users in database:');
  users.forEach(u => {
    console.log('  - ' + u.name + ' (' + u.email + ') - Role: ' + u.role);
  });
  
  const agents = users.filter(u => u.role === 'AGENT');
  console.log('\nTotal agents: ' + agents.length);
}

main()
  .finally(() => prisma.$disconnect());
