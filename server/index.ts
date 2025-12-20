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
        crisisAndShelterServices: true,
        survivorLeadershipAndMentorship: true,
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
        crisisAndShelterServices: true,
        survivorLeadershipAndMentorship: true,
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
    const {
      address,
      contactInformation,
      contacts,
      servicesOffered,
      crisisAndShelterServices,
      survivorLeadershipAndMentorship,
      trainingAndEducation,
      accessibilityAndInclusion,
      nonprofitName,
      description,
      businessType,
      regionsServed,
      websites,
      demographics,
      specificPopulations,
      collaborationAndPartnerships,
    } = req.body;

    const provider = await prisma.provider.create({
      data: {
        nonprofitName,
        description,
        businessType,
        regionsServed,
        websites,
        demographics,
        specificPopulations,
        collaborationAndPartnerships,
        // Create address
        address: address
          ? {
              create: {
                streetAddress1: address.streetAddress1 || '',
                streetAddress2: address.streetAddress2 || null,
                city: address.city || '',
                state: address.state || 'NC',
                zipCode: address.zipCode || '',
              },
            }
          : undefined,
        // Create contact information
        contactInformation: contactInformation
          ? {
              create: contactInformation.map((contact: any) => ({
                officePhone: contact.officePhone || null,
                generalEmail: contact.generalEmail || null,
                crisisHotline: contact.crisisHotline || null,
              })),
            }
          : undefined,
        // Create contacts
        contacts: contacts
          ? {
              create: contacts.map((contact: any) => ({
                primaryContact: contact.primaryContact,
                description: contact.description,
                phone: contact.phone || null,
                email: contact.email || null,
              })),
            }
          : undefined,
        // Create services offered
        servicesOffered: servicesOffered
          ? {
              create: {
                available247: servicesOffered.available247 || false,
                serviceCategories: servicesOffered.serviceCategories || [],
                languagesAvailable: servicesOffered.languagesAvailable || [],
                description: servicesOffered.description || '',
                translationServices: servicesOffered.translationServices || false,
                feesAndPaymentOptions: servicesOffered.feesAndPaymentOptions || [],
              },
            }
          : undefined,
        // Create crisis and shelter services
        crisisAndShelterServices: crisisAndShelterServices
          ? {
              create: {
                immediateCrisisResponse: crisisAndShelterServices.immediateCrisisResponse || false,
                responseTime: crisisAndShelterServices.responseTime || '',
                emergencyShelter: crisisAndShelterServices.emergencyShelter || false,
                emergencyShelterInfo: crisisAndShelterServices.emergencyShelterInfo || '',
              },
            }
          : undefined,
        // Create survivor leadership and mentorship
        survivorLeadershipAndMentorship: survivorLeadershipAndMentorship
          ? {
              create: {
                survivorsInLeadership: survivorLeadershipAndMentorship.survivorsInLeadership || false,
                peerMentorshipProgram: survivorLeadershipAndMentorship.peerMentorshipProgram || false,
              },
            }
          : undefined,
        // Create training and education
        trainingAndEducation: trainingAndEducation
          ? {
              create: {
                workshopsAndTrainingOffered: trainingAndEducation.workshopsAndTrainingOffered || false,
                topicsCovered: trainingAndEducation.topicsCovered || [],
                targetAudience: trainingAndEducation.targetAudience || [],
                trainingFormat: trainingAndEducation.trainingFormat || [],
              },
            }
          : undefined,
        // Create accessibility and inclusion
        accessibilityAndInclusion: accessibilityAndInclusion
          ? {
              create: {
                adaCompliant: accessibilityAndInclusion.adaCompliant || false,
                disabilityAccommodations: accessibilityAndInclusion.disabilityAccommodations || false,
                culturallyResponsiveServices: accessibilityAndInclusion.culturallyResponsiveServices || false,
              },
            }
          : undefined,
      },
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        crisisAndShelterServices: true,
        survivorLeadershipAndMentorship: true,
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
    const {
      id: _id,
      createdAt,
      updatedAt,
      address,
      contactInformation,
      contacts,
      servicesOffered,
      crisisAndShelterServices,
      survivorLeadershipAndMentorship,
      trainingAndEducation,
      accessibilityAndInclusion,
      nonprofitName,
      description,
      businessType,
      regionsServed,
      websites,
      demographics,
      specificPopulations,
      collaborationAndPartnerships,
    } = req.body;

    const updateData = {
      nonprofitName,
      description,
      businessType,
      regionsServed,
      websites,
      demographics,
      specificPopulations,
      collaborationAndPartnerships,
      // Update address using upsert
      address: address
        ? {
            upsert: {
              create: {
                streetAddress1: address.streetAddress1 || '',
                streetAddress2: address.streetAddress2 || null,
                city: address.city || '',
                state: address.state || 'NC',
                zipCode: address.zipCode || '',
              },
              update: {
                streetAddress1: address.streetAddress1 || '',
                streetAddress2: address.streetAddress2 || null,
                city: address.city || '',
                state: address.state || 'NC',
                zipCode: address.zipCode || '',
              },
            },
          }
        : undefined,
      // Update contact information
      contactInformation: contactInformation
        ? {
            deleteMany: {},
            create: contactInformation.map((contact: any) => ({
              officePhone: contact.officePhone,
              generalEmail: contact.generalEmail,
              crisisHotline: contact.crisisHotline,
            })),
          }
        : undefined,
      // Update contacts
      contacts: contacts
        ? {
            deleteMany: {},
            create: contacts.map((contact: any) => ({
              primaryContact: contact.primaryContact,
              description: contact.description,
              phone: contact.phone,
              email: contact.email,
            })),
          }
        : undefined,
      // Update services offered
      servicesOffered: servicesOffered
        ? {
            upsert: {
              create: {
                available247: servicesOffered.available247,
                serviceCategories: servicesOffered.serviceCategories,
                languagesAvailable: servicesOffered.languagesAvailable,
                description: servicesOffered.description,
                translationServices: servicesOffered.translationServices,
                feesAndPaymentOptions: servicesOffered.feesAndPaymentOptions,
              },
              update: {
                available247: servicesOffered.available247,
                serviceCategories: servicesOffered.serviceCategories,
                languagesAvailable: servicesOffered.languagesAvailable,
                description: servicesOffered.description,
                translationServices: servicesOffered.translationServices,
                feesAndPaymentOptions: servicesOffered.feesAndPaymentOptions,
              },
            },
          }
        : undefined,
      // Update crisis and shelter services
      crisisAndShelterServices: crisisAndShelterServices
        ? {
            upsert: {
              create: {
                immediateCrisisResponse: crisisAndShelterServices.immediateCrisisResponse,
                responseTime: crisisAndShelterServices.responseTime,
                emergencyShelter: crisisAndShelterServices.emergencyShelter,
                emergencyShelterInfo: crisisAndShelterServices.emergencyShelterInfo,
              },
              update: {
                immediateCrisisResponse: crisisAndShelterServices.immediateCrisisResponse,
                responseTime: crisisAndShelterServices.responseTime,
                emergencyShelter: crisisAndShelterServices.emergencyShelter,
                emergencyShelterInfo: crisisAndShelterServices.emergencyShelterInfo,
              },
            },
          }
        : undefined,
      // Update survivor leadership and mentorship
      survivorLeadershipAndMentorship: survivorLeadershipAndMentorship
        ? {
            upsert: {
              create: {
                survivorsInLeadership: survivorLeadershipAndMentorship.survivorsInLeadership,
                peerMentorshipProgram: survivorLeadershipAndMentorship.peerMentorshipProgram,
              },
              update: {
                survivorsInLeadership: survivorLeadershipAndMentorship.survivorsInLeadership,
                peerMentorshipProgram: survivorLeadershipAndMentorship.peerMentorshipProgram,
              },
            },
          }
        : undefined,
      // Update training and education
      trainingAndEducation: trainingAndEducation
        ? {
            upsert: {
              create: {
                workshopsAndTrainingOffered: trainingAndEducation.workshopsAndTrainingOffered,
                topicsCovered: trainingAndEducation.topicsCovered,
                targetAudience: trainingAndEducation.targetAudience,
                trainingFormat: trainingAndEducation.trainingFormat,
              },
              update: {
                workshopsAndTrainingOffered: trainingAndEducation.workshopsAndTrainingOffered,
                topicsCovered: trainingAndEducation.topicsCovered,
                targetAudience: trainingAndEducation.targetAudience,
                trainingFormat: trainingAndEducation.trainingFormat,
              },
            },
          }
        : undefined,
      // Update accessibility and inclusion
      accessibilityAndInclusion: accessibilityAndInclusion
        ? {
            upsert: {
              create: {
                adaCompliant: accessibilityAndInclusion.adaCompliant,
                disabilityAccommodations: accessibilityAndInclusion.disabilityAccommodations,
                culturallyResponsiveServices: accessibilityAndInclusion.culturallyResponsiveServices,
              },
              update: {
                adaCompliant: accessibilityAndInclusion.adaCompliant,
                disabilityAccommodations: accessibilityAndInclusion.disabilityAccommodations,
                culturallyResponsiveServices: accessibilityAndInclusion.culturallyResponsiveServices,
              },
            },
          }
        : undefined,
    };

    const provider = await prisma.provider.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        address: true,
        contactInformation: true,
        contacts: true,
        servicesOffered: true,
        crisisAndShelterServices: true,
        survivorLeadershipAndMentorship: true,
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
