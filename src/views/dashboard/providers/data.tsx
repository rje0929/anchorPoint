import { Provider } from 'types/provider';

export const providers: Provider[] = [
  {
    id: 1,
    nonprofitName: 'Abolition NC',
    businessType: ['Nonprofit'],
    regionsServed: ['Statewide', 'National'],
    websites: ['http://abolitionnc.org', 'http://freewaync.org'],
    description:
      'Partnering to combat human trafficking through awareness and prevention. AbolitionNC has an awareness and prevention human trafficking student curriculum designed to align with requirements for 7th, 8th, and 9th grade health classes in NC. It includes training for facilitators. AbolitionNC provides an online school staff training module on child sexual abuse and child trafficking that aligns with the NC legal requirements and includes tracking and technical support. AbolitionNC has a documentary called, "Bring to Light: Unveiling Truth about Human Trafficking" which is available for showing at NC events.',
    contactInformation: [
      {
        officePhone: '336-298-2208',
        generalEmail: 'Connect@AbolitionNC.org',
        crisisHotline: ''
      }
    ],
    contacts: [
      {
        primaryContact: 'Meg Williams',
        description: 'Director of Community Engagement',
        phone: '336-298-2208',
        email: 'Connect@AbolitionNC.org'
      }
    ],
    servicesOffered: {
      available247: false,
      serviceCategories: ['Education/Training'],
      description: '',
      languagesAvailable: ['English'],
      translationServices: true,
      feesAndPaymentOptions: ['Free']
    },
    demographics: [
      'Adults',
      'Children/Youth',
      'Families',
      'Immigrants/Refugees',
      'People with Disabilities',
      'Indigenous',
      'Populations',
      'All Genders',
      'Female-Identifying',
      'Male-Identifying',
      'LGBTQIA+'
    ],
    specificPopulations: ['We primarily serve schools, youth organizations, and the general community'],
    collaborationAndPartnerships: [
      'Triad Rapid Response Team',
      'NCCAHT',
      'Churches',
      'School Districts in NC',
      'Independent Schools',
      'Various organizations in NC and beyond'
    ],
    trainingAndEducation: {
      workshopsAndTrainingOffered: true,
      topicsCovered: ['Curriculum for Youth', 'School Staff Training', 'Community Training through our documentary showings'],
      targetAudience: ['Educators', 'Community Members'],
      trainingFormat: ['In-Person', 'Virtual']
    },
    survivorLeadershipAndMentorship: true,
    accessibilityAndInclusion: {
      adaCompliant: false,
      disabilityAccomadations: false
    }
  },
  {
    id: 2,
    nonprofitName: 'Compassion to Act',
    businessType: ['Nonprofit'],
    regionsServed: ['Statewide'],
    websites: ['http://www.compassiontoact.org'],
    description: '',
    contactInformation: [
      {
        officePhone: '704-288-7230',
        generalEmail: 'info@compassiontoact.org',
        crisisHotline: '980-319-9595'
      }
    ],
    contacts: [
      {
        primaryContact: 'Debbie Gates',
        description: 'President/Founder',
        phone: '704-819-7749',
        email: 'debbie@compassionact.org'
      }
    ],
    servicesOffered: {
      available247: true,
      serviceCategories: ['Advocacy', 'Education/Training', 'Long-Term Restorative Housing'],
      languagesAvailable: ['English', 'Spanish'],
      description: '',
      translationServices: true,
      feesAndPaymentOptions: ['Free']
    },
    demographics: ['Adults (Women)'],
    specificPopulations: ['Domestic Survivors', 'Sex Trafficking Survivors'],
    collaborationAndPartnerships: [''],
    trainingAndEducation: {
      workshopsAndTrainingOffered: true,
      topicsCovered: [],
      targetAudience: ['Law Enforcement', 'Medical Professionals', 'Mental Health Providers', 'Educators', 'Community Members'],
      trainingFormat: ['In-Person']
    },
    survivorLeadershipAndMentorship: false,
    accessibilityAndInclusion: {
      adaCompliant: true,
      disabilityAccomadations: true
    }
  }
];
