import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../src/generated/prisma';
import { createClient } from '@supabase/supabase-js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3010;

// Initialize Supabase client for JWT verification
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

// JWT verification middleware
const verifyToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object for use in route handlers
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all providers (protected route)
app.get('/api/providers', verifyToken, async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        trainingAndEducation: true,
        accessibilityAndInclusion: true,
      },
      orderBy: {
        nonprofitName: 'asc',
      },
    });
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get provider by ID (protected route)
app.get('/api/providers/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        trainingAndEducation: true,
        accessibilityAndInclusion: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// Create provider (protected route - admin only)
app.post('/api/providers', verifyToken, async (req, res) => {
  try {
    const provider = await prisma.provider.create({
      data: req.body,
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        trainingAndEducation: true,
        accessibilityAndInclusion: true,
      },
    });
    res.status(201).json(provider);
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// Update provider (protected route - admin only)
app.put('/api/providers/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        trainingAndEducation: true,
        accessibilityAndInclusion: true,
      },
    });
    res.json(provider);
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// Delete provider (protected route - admin only)
app.delete('/api/providers/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.provider.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
