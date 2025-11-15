import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../src/generated/prisma';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all providers
app.get('/api/providers', async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
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

// Get provider by ID
app.get('/api/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
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

// Create provider
app.post('/api/providers', async (req, res) => {
  try {
    const provider = await prisma.provider.create({
      data: req.body,
      include: {
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

// Update provider
app.put('/api/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
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

// Delete provider
app.delete('/api/providers/:id', async (req, res) => {
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
