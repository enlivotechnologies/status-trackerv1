const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating a new agent...\n');
  
  const agentEmail = 'anush@realestate.com';
  const agentPassword = 'agent123';
  const agentName = 'Anush';
  
  // Check if agent already exists
  const existing = await prisma.user.findUnique({
    where: { email: agentEmail }
  });
  
  if (existing) {
    console.log('Agent already exists: ' + existing.name + ' (' + existing.email + ')');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(agentPassword, 10);
  
  const agent = await prisma.user.create({
    data: {
      email: agentEmail,
      password: hashedPassword,
      name: agentName,
      role: 'AGENT'
    }
  });
  
  console.log('Agent created successfully!');
  console.log('  Name: ' + agent.name);
  console.log('  Email: ' + agent.email);
  console.log('  Password: ' + agentPassword);
  console.log('\nYou can now login as this agent.');
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
