import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = 'admin@realestate.com';
  const adminPassword = 'admin123'; // Change this in production!

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample agent
  const agentEmail = 'agent@realestate.com';
  const agentPassword = 'agent123'; // Change this in production!

  const agentHashedPassword = await bcrypt.hash(agentPassword, 10);

  const agent = await prisma.user.upsert({
    where: { email: agentEmail },
    update: {},
    create: {
      email: agentEmail,
      password: agentHashedPassword,
      name: 'Sample Agent',
      role: UserRole.AGENT,
    },
  });

  console.log('✅ Agent user created:', agent.email);

  // Create second agent
  const agent2Email = 'agent2@realestate.com';
  const agent2Password = 'agent2123'; // Change this in production!

  const agent2HashedPassword = await bcrypt.hash(agent2Password, 10);

  const agent2 = await prisma.user.upsert({
    where: { email: agent2Email },
    update: {},
    create: {
      email: agent2Email,
      password: agent2HashedPassword,
      name: 'Second Agent',
      role: UserRole.AGENT,
    },
  });

  console.log('Second agent user created:', agent2.email);

  console.log('\n📝 Login credentials:');
  console.log('Admin:', adminEmail, '/', adminPassword);
  console.log('Agent 1:', agentEmail, '/', agentPassword);
  console.log('Agent 2:', agent2Email, '/', agent2Password);
  console.log('\n Please change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
