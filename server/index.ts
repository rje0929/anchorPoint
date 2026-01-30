import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient, Role } from '../src/generated/prisma';
import { createClient } from '@supabase/supabase-js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3010;

// Type for request with user attached
interface AuthenticatedRequest extends express.Request {
  user?: { id: string; email?: string };
  dbUser?: { id: string; email: string; name: string | null; role: Role; isVerified: boolean };
}

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

  // Allow test token for E2E tests (only in development/test environments)
  const TEST_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-token-for-e2e-tests';
  if (token === TEST_TOKEN && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // Mock user for tests - set as verified ADMIN
    (req as AuthenticatedRequest).user = {
      id: 'test-user-id',
      email: 'test@anchorpoint.example.com'
    };
    (req as AuthenticatedRequest).dbUser = {
      id: 'test-user-id',
      email: 'test@anchorpoint.example.com',
      name: 'Test User',
      role: 'ADMIN',
      isVerified: true
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object for use in route handlers
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to require verified user
const requireVerified = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authReq = req as AuthenticatedRequest;

  // If dbUser already set (e.g., test mode), check verification
  if (authReq.dbUser) {
    if (!authReq.dbUser.isVerified) {
      return res.status(403).json({ error: 'Account pending verification', code: 'PENDING_VERIFICATION' });
    }
    return next();
  }

  const user = authReq.user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return res.status(403).json({ error: 'User not found in database', code: 'USER_NOT_FOUND' });
    }

    if (!dbUser.isVerified) {
      return res.status(403).json({ error: 'Account pending verification', code: 'PENDING_VERIFICATION' });
    }

    authReq.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    return res.status(500).json({ error: 'Failed to check verification status' });
  }
};

// Middleware to require specific roles (also checks verification)
const requireRole = (...allowedRoles: Role[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    // If dbUser already set (e.g., test mode), check role
    if (authReq.dbUser) {
      if (!authReq.dbUser.isVerified) {
        return res.status(403).json({ error: 'Account pending verification', code: 'PENDING_VERIFICATION' });
      }
      if (!allowedRoles.includes(authReq.dbUser.role)) {
        return res.status(403).json({ error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }
      return next();
    }

    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!dbUser) {
        return res.status(403).json({ error: 'User not found in database', code: 'USER_NOT_FOUND' });
      }

      if (!dbUser.isVerified) {
        return res.status(403).json({ error: 'Account pending verification', code: 'PENDING_VERIFICATION' });
      }

      if (!allowedRoles.includes(dbUser.role)) {
        return res.status(403).json({ error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }

      authReq.dbUser = dbUser;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Failed to check permissions' });
    }
  };
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================================|| USER MANAGEMENT ||================================ //

// Sync user profile on login (create if not exists)
app.post('/api/users/sync', verifyToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Check if user exists
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    let isNewUser = false;

    if (!dbUser) {
      // Create new user with READ_ONLY role and unverified
      isNewUser = true;
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          name: null,
          role: 'READ_ONLY',
          isVerified: false
        }
      });
    }

    res.json({ ...dbUser, isNewUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

// Get current user profile
app.get('/api/users/me', verifyToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(dbUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get all users (admin only)
app.get('/api/users', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
app.put('/api/users/:id/role', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'READ_ONLY'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ADMIN or READ_ONLY' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as Role }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Verify/approve user (admin only)
app.put('/api/users/:id/verify', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Revoke access / unverify user (admin only)
app.put('/api/users/:id/unverify', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: false }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error revoking user access:', error);
    res.status(500).json({ error: 'Failed to revoke user access' });
  }
});

// Delete user (admin only, READ_ONLY users only)
app.delete('/api/users/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;

    // Prevent admins from deleting themselves
    if (authReq.user?.id === id || authReq.dbUser?.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists and is READ_ONLY
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.role !== 'READ_ONLY') {
      return res.status(400).json({ error: 'Can only delete READ_ONLY users. Change their role first if needed.' });
    }

    // Delete from Supabase Auth first
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(id);

    if (supabaseError) {
      console.error('Error deleting user from Supabase:', supabaseError);
      return res.status(500).json({ error: 'Failed to delete user from authentication system' });
    }

    // Delete from database
    await prisma.user.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ================================|| PROVIDERS ||================================ //

// Get all providers (verified users only)
app.get('/api/providers', verifyToken, requireVerified, async (req, res) => {
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

// Get provider by ID (verified users only)
app.get('/api/providers/:id', verifyToken, requireVerified, async (req, res) => {
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

// Create provider (admin only)
app.post('/api/providers', verifyToken, requireRole('ADMIN'), async (req, res) => {
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

// Update provider (admin only)
app.put('/api/providers/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
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

// Delete provider (admin only)
app.delete('/api/providers/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
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
