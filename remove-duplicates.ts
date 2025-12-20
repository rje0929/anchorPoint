import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function removeDuplicates() {
  console.log('🔍 Checking for duplicate providers...\n');

  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      nonprofitName: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  // Group by nonprofit name
  const grouped = new Map<string, number[]>();
  providers.forEach(p => {
    const ids = grouped.get(p.nonprofitName) || [];
    ids.push(p.id);
    grouped.set(p.nonprofitName, ids);
  });

  // Find duplicates
  const duplicates: { name: string; idsToDelete: number[] }[] = [];
  for (const [name, ids] of grouped.entries()) {
    if (ids.length > 1) {
      // Keep the first one (lowest ID), delete the rest
      const idsToDelete = ids.slice(1);
      duplicates.push({ name, idsToDelete });
      console.log(`Found duplicate: ${name}`);
      console.log(`  Keeping ID: ${ids[0]}`);
      console.log(`  Deleting IDs: ${idsToDelete.join(', ')}`);
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    await prisma.$disconnect();
    return;
  }

  console.log(`\n🗑️  Removing ${duplicates.reduce((acc, d) => acc + d.idsToDelete.length, 0)} duplicate records...\n`);

  // Delete duplicates
  for (const { name, idsToDelete } of duplicates) {
    for (const id of idsToDelete) {
      await prisma.provider.delete({
        where: { id },
      });
      console.log(`✓ Deleted provider ID ${id} (${name})`);
    }
  }

  console.log('\n✅ Done! Duplicates removed.');

  // Verify
  const remaining = await prisma.provider.count();
  console.log(`\n📊 Total providers remaining: ${remaining}`);

  await prisma.$disconnect();
}

removeDuplicates().catch(console.error);
