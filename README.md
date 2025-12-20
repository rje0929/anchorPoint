# anchorPoint
This project is to help support the efforts to help men and women who have been victimized by human trafficking.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd anchorPoint
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
PORT=3010
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Seed the database
```bash
npx tsx prisma/seed.ts
```

## Development

### Running the application

Start both the frontend and backend servers:
```bash
npm run dev
```

This runs:
- Frontend: React + Vite (default port 3000)
- Backend: Express server (port 3010)

### Running servers individually

Frontend only:
```bash
npm start
```

Backend only:
```bash
npm run server
```

## Database Management

### Seeding the Database

The database is seeded from the `nonprofits.json` file in the root directory.

To seed the database with initial data:
```bash
npx tsx prisma/seed.ts
```

### Reseeding the Database

If you need to clear all existing data and reseed from scratch:

1. Clear the database and reseed in one command:
```bash
npx tsx prisma/reset-and-seed.ts && npx tsx prisma/seed.ts
```

2. Or run the steps separately:
```bash
# Clear all data
npx tsx prisma/reset-and-seed.ts

# Seed the database
npx tsx prisma/seed.ts
```

### Updating Provider Data

1. Update the `nonprofits.json` file with your changes
2. Run the reseed command:
```bash
npx tsx prisma/reset-and-seed.ts && npx tsx prisma/seed.ts
```

### Database Migrations

If you make changes to the Prisma schema (`prisma/schema.prisma`):

```bash
# Push schema changes to the database
npx prisma db push

# Generate updated Prisma client
npx prisma generate
```

## Deployment

For production deployment to AWS Lightsail using Pulumi, see the [Pulumi Deployment Guide](pulumi/README.md).

Quick deployment:
```bash
cd pulumi
npm install
pulumi up
```

Cost: ~$10-15/month for a complete production environment.

## Project Structure

```
anchorPoint/
├── prisma/              # Prisma schema and database scripts
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding script
│   └── reset-and-seed.ts # Database reset script
├── pulumi/              # Infrastructure as Code for AWS deployment
│   ├── index.ts         # Pulumi infrastructure definition
│   ├── deploy.sh        # Deployment helper script
│   └── README.md        # Deployment documentation
├── server/              # Express backend
│   └── index.ts         # API routes and server configuration
├── src/                 # React frontend
│   ├── views/           # Page components
│   ├── services/        # API service layer
│   └── types/           # TypeScript type definitions
├── nonprofits.json      # Provider data for seeding
└── README.md
```
