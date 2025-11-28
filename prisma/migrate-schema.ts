import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function migrateSchema() {
  console.log('🔄 Starting schema migration...');

  try {
    // Step 1: Add new tables
    console.log('📝 Creating CrisisAndShelterServices table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CrisisAndShelterServices" (
        "id" TEXT NOT NULL,
        "immediateCrisisResponse" BOOLEAN NOT NULL DEFAULT false,
        "responseTime" TEXT NOT NULL,
        "emergencyShelter" BOOLEAN NOT NULL DEFAULT false,
        "emergencyShelterInfo" TEXT NOT NULL,
        "providerId" INTEGER NOT NULL,

        CONSTRAINT "CrisisAndShelterServices_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('📝 Creating SurvivorLeadershipAndMentorship table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SurvivorLeadershipAndMentorship" (
        "id" TEXT NOT NULL,
        "survivorsInLeadership" BOOLEAN NOT NULL DEFAULT false,
        "peerMentorshipProgram" BOOLEAN NOT NULL DEFAULT false,
        "providerId" INTEGER NOT NULL,

        CONSTRAINT "SurvivorLeadershipAndMentorship_pkey" PRIMARY KEY ("id")
      );
    `);

    // Step 2: Modify existing Address table
    console.log('📝 Updating Address table structure...');

    // Check if streetAddress column exists
    const hasStreetAddress = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Address' AND column_name = 'streetAddress'
    `);

    if (Array.isArray(hasStreetAddress) && hasStreetAddress.length > 0) {
      // Rename streetAddress to streetAddress1
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Address"
        RENAME COLUMN "streetAddress" TO "streetAddress1";
      `);
    }

    // Add streetAddress2 if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Address"
      ADD COLUMN IF NOT EXISTS "streetAddress2" TEXT;
    `);

    // Add latitude and longitude columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Address"
      ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Address"
      ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
    `);

    // Step 3: Update AccessibilityAndInclusion table
    console.log('📝 Updating AccessibilityAndInclusion table...');

    // Rename column if old spelling exists
    const hasOldSpelling = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'AccessibilityAndInclusion' AND column_name = 'disabilityAccomadations'
    `);

    if (Array.isArray(hasOldSpelling) && hasOldSpelling.length > 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "AccessibilityAndInclusion"
        RENAME COLUMN "disabilityAccomadations" TO "disabilityAccommodations";
      `);
    }

    // Add new column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AccessibilityAndInclusion"
      ADD COLUMN IF NOT EXISTS "culturallyResponsiveServices" BOOLEAN NOT NULL DEFAULT false;
    `);

    // Step 4: Remove old survivorLeadershipAndMentorship column from Provider if it exists
    console.log('📝 Updating Provider table...');
    const hasOldColumn = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Provider' AND column_name = 'survivorLeadershipAndMentorship'
    `);

    if (Array.isArray(hasOldColumn) && hasOldColumn.length > 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Provider"
        DROP COLUMN "survivorLeadershipAndMentorship";
      `);
    }

    // Step 5: Add unique constraints
    console.log('📝 Adding unique constraints...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CrisisAndShelterServices_providerId_key"
      ON "CrisisAndShelterServices"("providerId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SurvivorLeadershipAndMentorship_providerId_key"
      ON "SurvivorLeadershipAndMentorship"("providerId");
    `);

    // Step 6: Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'CrisisAndShelterServices_providerId_fkey'
        ) THEN
          ALTER TABLE "CrisisAndShelterServices"
          ADD CONSTRAINT "CrisisAndShelterServices_providerId_fkey"
          FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'SurvivorLeadershipAndMentorship_providerId_fkey'
        ) THEN
          ALTER TABLE "SurvivorLeadershipAndMentorship"
          ADD CONSTRAINT "SurvivorLeadershipAndMentorship_providerId_fkey"
          FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log('✅ Schema migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateSchema()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
