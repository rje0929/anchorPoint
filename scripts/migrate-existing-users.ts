/**
 * Migration script to create User records for existing Supabase Auth users.
 * All existing users will be set as ADMIN with isVerified = true.
 *
 * Run this script after deploying the schema changes:
 *   npx tsx scripts/migrate-existing-users.ts
 *
 * Prerequisites:
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable must be set
 *   - Database must be accessible
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Initialize Supabase admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateExistingUsers() {
  console.log('Starting migration of existing Supabase users...\n');

  try {
    // Fetch all users from Supabase Auth using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching users from Supabase:', authError);
      process.exit(1);
    }

    const supabaseUsers = authData.users;
    console.log(`Found ${supabaseUsers.length} users in Supabase Auth.\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const authUser of supabaseUsers) {
      try {
        // Check if user already exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { id: authUser.id }
        });

        if (existingUser) {
          console.log(`  [SKIP] User ${authUser.email} already exists in database`);
          skipped++;
          continue;
        }

        // Create new user with ADMIN role and verified status
        await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.display_name || null,
            role: 'ADMIN',
            isVerified: true
          }
        });

        console.log(`  [CREATED] ${authUser.email} as ADMIN (verified)`);
        created++;
      } catch (err) {
        console.error(`  [ERROR] Failed to migrate user ${authUser.email}:`, err);
        errors++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`  Created: ${created}`);
    console.log(`  Skipped (already exists): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('-------------------------\n');

    if (errors > 0) {
      console.log('Migration completed with errors. Please review the output above.');
      process.exit(1);
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (error) {
    console.error('Migration failed with unexpected error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingUsers();
