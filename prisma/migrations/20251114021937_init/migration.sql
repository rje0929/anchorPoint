-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "nonprofitName" TEXT NOT NULL,
    "businessType" TEXT[],
    "regionsServed" TEXT[],
    "websites" TEXT[],
    "description" TEXT NOT NULL,
    "demographics" TEXT[],
    "specificPopulations" TEXT[],
    "collaborationAndPartnerships" TEXT[],
    "survivorLeadershipAndMentorship" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInformation" (
    "id" TEXT NOT NULL,
    "officePhone" TEXT,
    "generalEmail" TEXT,
    "crisisHotline" TEXT,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "ContactInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "primaryContact" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicesOffered" (
    "id" TEXT NOT NULL,
    "available247" BOOLEAN NOT NULL DEFAULT false,
    "serviceCategories" TEXT[],
    "languagesAvailable" TEXT[],
    "description" TEXT NOT NULL,
    "translationServices" BOOLEAN NOT NULL DEFAULT false,
    "feesAndPaymentOptions" TEXT[],
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "ServicesOffered_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAndEducation" (
    "id" TEXT NOT NULL,
    "workshopsAndTrainingOffered" BOOLEAN NOT NULL DEFAULT false,
    "topicsCovered" TEXT[],
    "targetAudience" TEXT[],
    "trainingFormat" TEXT[],
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "TrainingAndEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessibilityAndInclusion" (
    "id" TEXT NOT NULL,
    "adaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "disabilityAccomadations" BOOLEAN NOT NULL DEFAULT false,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "AccessibilityAndInclusion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Provider_nonprofitName_idx" ON "Provider"("nonprofitName");

-- CreateIndex
CREATE INDEX "ContactInformation_providerId_idx" ON "ContactInformation"("providerId");

-- CreateIndex
CREATE INDEX "Contact_providerId_idx" ON "Contact"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesOffered_providerId_key" ON "ServicesOffered"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAndEducation_providerId_key" ON "TrainingAndEducation"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessibilityAndInclusion_providerId_key" ON "AccessibilityAndInclusion"("providerId");

-- AddForeignKey
ALTER TABLE "ContactInformation" ADD CONSTRAINT "ContactInformation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicesOffered" ADD CONSTRAINT "ServicesOffered_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAndEducation" ADD CONSTRAINT "TrainingAndEducation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessibilityAndInclusion" ADD CONSTRAINT "AccessibilityAndInclusion_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
