# Prisma Setup Guide

This project now uses Prisma ORM with a Supabase PostgreSQL database for managing provider data.

## Setup Complete

### What was installed:
- Prisma ORM (`prisma` and `@prisma/client`)
- Express.js server for API endpoints
- TypeScript execution (`tsx`)
- CORS support

### Files Created:

#### Database & ORM:
- `prisma/schema.prisma` - Database schema with Provider models
- `prisma/migrations/` - Database migration history
- `prisma/seed.ts` - Seed script for initial data
- `prisma/seed-data.json` - Provider seed data
- `src/generated/prisma/` - Generated Prisma Client
- `src/lib/prisma.ts` - Prisma client instance

#### Backend API:
- `server/index.ts` - Express API server with provider endpoints
- `src/services/providerService.ts` - Frontend service for API calls

#### Frontend:
- `src/views/dashboard/providers/providerList.tsx` - Updated to fetch from API
- `src/types/provider.ts` - Updated TypeScript types to match Prisma schema

## Running the Application

### Start Both Frontend and Backend:
```bash
npm run dev
```
This runs both the Vite frontend (port 5173) and Express backend (port 3010) concurrently.

### Or Run Separately:

**Frontend only:**
```bash
npm start
```

**Backend API only:**
```bash
npm run server
```

## API Endpoints

Base URL: `http://localhost:3010/api`

- `GET /api/providers` - Get all providers with related data
- `GET /api/providers/:id` - Get a specific provider by ID
- `POST /api/providers` - Create a new provider
- `PUT /api/providers/:id` - Update a provider
- `DELETE /api/providers/:id` - Delete a provider

## Database Schema

### Main Models:
- **Provider** - Main provider information
- **ContactInformation** - Provider contact details (one-to-many)
- **Contact** - Individual contacts at provider (one-to-many)
- **ServicesOffered** - Services offered by provider (one-to-one)
- **TrainingAndEducation** - Training programs (one-to-one)
- **AccessibilityAndInclusion** - Accessibility information (one-to-one)

## Common Commands

### Database:
```bash
# Run migrations
npx prisma migrate dev

# Reset database (warning: deletes all data!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Prisma Client:
```bash
# Generate Prisma Client after schema changes
npx prisma generate
```

## Environment Variables

Required in `.env`:
```env
# Database connection (pooled - for queries)
DATABASE_URL="postgresql://..."

# Direct connection (for migrations)
DIRECT_URL="postgresql://..."

# API URL for frontend
VITE_APP_API_URL="http://localhost:3010/"
```

## Using Prisma in Your Code

### Server-side (API):
```typescript
import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

// Query providers
const providers = await prisma.provider.findMany({
  include: {
    contactInformation: true,
    contacts: true,
    servicesOffered: true,
  }
});
```

### Client-side (React):
```typescript
import { providerService } from './services/providerService';

// Fetch providers
const providers = await providerService.getAllProviders();
```

## Troubleshooting

### "Failed to load providers" error:
Make sure the API server is running:
```bash
npm run server
```

### Database connection errors:
1. Check your `.env` file has correct `DATABASE_URL` and `DIRECT_URL`
2. Verify Supabase database is accessible
3. For migrations, use port 5432 (direct connection)
4. For queries, use port 6543 (pooled connection)

### After schema changes:
```bash
npx prisma generate
npx prisma migrate dev --name your_migration_name
```

## Current Seed Data

The database has been seeded with 3 providers:
1. Abolition NC
2. Compassion to Act
3. Creative Counseling and Learning Solutions, PPLC/Dandelion Turtles

To re-seed:
```bash
npx prisma db seed
```
