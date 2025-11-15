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
  survivorLeadershipAndMentorship: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
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
    disabilityAccomadations: boolean;
    providerId: number;
  } | null;
};
