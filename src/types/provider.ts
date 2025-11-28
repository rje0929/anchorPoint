export type Provider = {
  id: number;
  nonprofitName: string;
  businessType: string[];
  regionsServed: string[];
  websites: string[];
  description: string;
  demographics: string[];
  specificPopulations: string[];
  collaborationAndPartnerships: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  address?: {
    id: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number | null;
    longitude?: number | null;
    providerId: number;
  } | null;
  contactInformation?: {
    id: string;
    officePhone?: string | null;
    generalEmail?: string | null;
    crisisHotline?: string | null;
    providerId: number;
  }[];
  contacts?: {
    id: string;
    primaryContact: string;
    description: string;
    phone?: string | null;
    email?: string | null;
    providerId: number;
  }[];
  servicesOffered?: {
    id: string;
    available247: boolean;
    serviceCategories: string[];
    languagesAvailable: string[];
    description: string;
    translationServices: boolean;
    feesAndPaymentOptions: string[];
    providerId: number;
  } | null;
  crisisAndShelterServices?: {
    id: string;
    immediateCrisisResponse: boolean;
    responseTime: string;
    emergencyShelter: boolean;
    emergencyShelterInfo: string;
    providerId: number;
  } | null;
  survivorLeadershipAndMentorship?: {
    id: string;
    survivorsInLeadership: boolean;
    peerMentorshipProgram: boolean;
    providerId: number;
  } | null;
  trainingAndEducation?: {
    id: string;
    workshopsAndTrainingOffered: boolean;
    topicsCovered: string[];
    targetAudience: string[];
    trainingFormat: string[];
    providerId: number;
  } | null;
  accessibilityAndInclusion?: {
    id: string;
    adaCompliant: boolean;
    disabilityAccommodations: boolean;
    culturallyResponsiveServices: boolean;
    providerId: number;
  } | null;
};
