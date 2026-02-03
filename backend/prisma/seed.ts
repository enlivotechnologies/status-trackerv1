import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = 'admin@college.com';
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

  // Create Neha coordinator
  const nehaEmail = 'neha@college.com';
  const nehaPassword = 'neha123'; // Change this in production!

  const nehaHashedPassword = await bcrypt.hash(nehaPassword, 10);

  const neha = await prisma.user.upsert({
    where: { email: nehaEmail },
    update: {},
    create: {
      email: nehaEmail,
      password: nehaHashedPassword,
      name: 'Neha',
      role: UserRole.AGENT,
    },
  });

  console.log('✅ Coordinator created:', neha.email);

  // Create Abhi coordinator
  const abhiEmail = 'abhi@college.com';
  const abhiPassword = 'abhi123'; // Change this in production!

  const abhiHashedPassword = await bcrypt.hash(abhiPassword, 10);

  const abhi = await prisma.user.upsert({
    where: { email: abhiEmail },
    update: {},
    create: {
      email: abhiEmail,
      password: abhiHashedPassword,
      name: 'Abhi',
      role: UserRole.AGENT,
    },
  });

  console.log('✅ Coordinator created:', abhi.email);

  console.log('\n📝 Login credentials:');
  console.log('Admin:', adminEmail, '/', adminPassword);
  console.log('Neha:', nehaEmail, '/', nehaPassword);
  console.log('Abhi:', abhiEmail, '/', abhiPassword);
  console.log('\n⚠️ Please change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
