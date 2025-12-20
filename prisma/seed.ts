import { PrismaClient } from '../src/generated/prisma';
import seedData from '../nonprofits.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  for (const providerData of seedData) {
    console.log(`📦 Seeding provider: ${providerData.nonprofitName}`);

    const provider = await prisma.provider.create({
      data: {
        nonprofitName: providerData.nonprofitName,
        businessType: providerData.businessType,
        regionsServed: providerData.regionsServed,
        websites: providerData.websites,
        description: providerData.description || '',
        demographics: providerData.demographics || [],
        specificPopulations: providerData.specificPopulations || [],
        collaborationAndPartnerships: providerData.collaborationAndPartnerships || [],

        // Create related contact information
        contactInformation: {
          create: providerData.contactInformation.map((contact) => ({
            officePhone: contact.officePhone || null,
            generalEmail: contact.generalEmail || null,
            crisisHotline: contact.crisisHotline || null,
          })),
        },

        // Create related contacts
        contacts: {
          create: providerData.contacts.map((contact) => ({
            primaryContact: contact.primaryContact,
            description: contact.description,
            phone: contact.phone || null,
            email: contact.email || null,
          })),
        },

        // Create services offered if available
        servicesOffered: providerData.servicesOffered
          ? {
              create: {
                available247: providerData.servicesOffered.available247 || false,
                serviceCategories: providerData.servicesOffered.serviceCategories || [],
                languagesAvailable: providerData.servicesOffered.languagesAvailable || [],
                description: providerData.servicesOffered.description || '',
                translationServices: providerData.servicesOffered.translationServices || false,
                feesAndPaymentOptions: providerData.servicesOffered.feesAndPaymentOptions || [],
              },
            }
          : undefined,

        // Create training and education if available
        trainingAndEducation: providerData.trainingAndEducation
          ? {
              create: {
                workshopsAndTrainingOffered: providerData.trainingAndEducation.workshopsAndTrainingOffered || false,
                topicsCovered: providerData.trainingAndEducation.topicsCovered || [],
                targetAudience: providerData.trainingAndEducation.targetAudience || [],
                trainingFormat: providerData.trainingAndEducation.trainingFormat || [],
              },
            }
          : undefined,

        // Create address if available
        address: providerData.address
          ? {
              create: {
                streetAddress1: providerData.address.streetAddress1 || '',
                streetAddress2: providerData.address.streetAddress2 || null,
                city: providerData.address.city || '',
                state: providerData.address.state || 'NC',
                zipCode: providerData.address.zipCode || '',
              },
            }
          : undefined,

        // Create crisis and shelter services if available
        crisisAndShelterServices: providerData.crisisAndShelterServices
          ? {
              create: {
                immediateCrisisResponse: providerData.crisisAndShelterServices.immediateCrisisResponse || false,
                responseTime: providerData.crisisAndShelterServices.responseTime || '',
                emergencyShelter: providerData.crisisAndShelterServices.emergencyShelter || false,
                emergencyShelterInfo: providerData.crisisAndShelterServices.emergencyShelterInfo || '',
              },
            }
          : undefined,

        // Create survivor leadership and mentorship if available
        survivorLeadershipAndMentorship:
          providerData.survivorLeadershipAndMentorship &&
          typeof providerData.survivorLeadershipAndMentorship === 'object'
            ? {
                create: {
                  survivorsInLeadership: providerData.survivorLeadershipAndMentorship.survivorsInLeadership || false,
                  peerMentorshipProgram: providerData.survivorLeadershipAndMentorship.peerMentorshipProgram || false,
                },
              }
            : undefined,

        // Create accessibility and inclusion if available
        accessibilityAndInclusion:
          providerData.accessibilityAndInclusion &&
          Object.keys(providerData.accessibilityAndInclusion).length > 0
            ? {
                create: {
                  adaCompliant: providerData.accessibilityAndInclusion.adaCompliant || false,
                  disabilityAccommodations: providerData.accessibilityAndInclusion.disabilityAccommodations || false,
                  culturallyResponsiveServices: providerData.accessibilityAndInclusion.culturallyResponsiveServices || false,
                },
              }
            : undefined,
      },
    });

    console.log(`✅ Created provider: ${provider.nonprofitName} (ID: ${provider.id})`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
