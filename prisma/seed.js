const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = (pw) => bcrypt.hash(pw, 12);

  await prisma.user.upsert({
    where: { email: 'admin@patent.demo' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@patent.demo',
      passwordHash: await hash('Admin1234!'),
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { email: 'examiner@patent.demo' },
    update: {},
    create: {
      name: 'Jane Examiner',
      email: 'examiner@patent.demo',
      passwordHash: await hash('Examine1234!'),
      role: 'EXAMINER',
    },
  });
  await prisma.user.upsert({
    where: { email: 'applicant@patent.demo' },
    update: {},
    create: {
      name: 'John Applicant',
      email: 'applicant@patent.demo',
      passwordHash: await hash('Apply1234!'),
      role: 'APPLICANT',
    },
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
