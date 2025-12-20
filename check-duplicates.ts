import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function checkDuplicates() {
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      nonprofitName: true,
    },
    orderBy: {
      nonprofitName: 'asc',
    },
  });

  console.log('Total providers:', providers.length);
  console.log('\nProviders:');
  providers.forEach(p => console.log(`ID: ${p.id}, Name: ${p.nonprofitName}`));

  // Check for duplicate names
  const names = new Map<string, number>();
  providers.forEach(p => {
    const count = names.get(p.nonprofitName) || 0;
    names.set(p.nonprofitName, count + 1);
  });

  console.log('\nDuplicate names:');
  for (const [name, count] of names.entries()) {
    if (count > 1) {
      console.log(`${name}: ${count} times`);
    }
  }

  await prisma.$disconnect();
}

checkDuplicates();
