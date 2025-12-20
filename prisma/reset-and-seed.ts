import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log('🗑️  Clearing database...\n');

  // Delete all records in the correct order (respecting foreign key constraints)
  await prisma.contactInformation.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.servicesOffered.deleteMany();
  await prisma.crisisAndShelterServices.deleteMany();
  await prisma.survivorLeadershipAndMentorship.deleteMany();
  await prisma.trainingAndEducation.deleteMany();
  await prisma.accessibilityAndInclusion.deleteMany();
  await prisma.address.deleteMany();
  await prisma.provider.deleteMany();

  console.log('✅ Database cleared!\n');
  console.log('🌱 Running seed script...\n');

  await prisma.$disconnect();
}

resetAndSeed()
  .catch((e) => {
    console.error('❌ Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
