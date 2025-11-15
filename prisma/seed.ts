import { PrismaClient } from '../src/generated/prisma';
import seedData from './seed-data.json';

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
        survivorLeadershipAndMentorship: providerData.survivorLeadershipAndMentorship || false,

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

        // Create accessibility and inclusion if available
        accessibilityAndInclusion:
          providerData.accessibilityAndInclusion &&
          Object.keys(providerData.accessibilityAndInclusion).length > 0
            ? {
                create: {
                  adaCompliant: providerData.accessibilityAndInclusion.adaCompliant || false,
                  disabilityAccomadations: providerData.accessibilityAndInclusion.disabilityAccomadations || false,
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
