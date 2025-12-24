import { Page } from '@playwright/test';

/**
 * Gets Supabase session token from localStorage
 */
async function getSessionToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    console.log('LocalStorage keys:', keys);

    // Try different possible Supabase session key formats
    const supabaseKey = keys.find(key =>
      key.includes('supabase') && key.includes('auth')
    );

    if (supabaseKey) {
      const data = localStorage.getItem(supabaseKey);
      console.log('Session key found:', supabaseKey);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log('Session data structure:', Object.keys(parsed));
          return parsed.access_token || parsed.currentSession?.access_token || parsed.session?.access_token;
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }
    }
    console.error('No Supabase session key found in:', keys);
    return null;
  });
}

/**
 * Creates test provider data via API
 * @param page - Playwright page object (used to get session cookies)
 * @returns Array of created provider IDs for cleanup
 */
export async function createTestProviders(page: Page): Promise<number[]> {
  const baseURL = process.env.VITE_APP_API_URL || 'http://localhost:3010';
  const createdIds: number[] = [];

  const sessionToken = await getSessionToken(page);

  if (!sessionToken) {
    console.error('No Supabase session found');
    return createdIds;
  }

  // Create test provider 1
  const provider1 = {
    nonprofitName: 'Test Provider 1',
    businessType: ['Nonprofit'],
    regionsServed: ['Region A', 'Region B'],
    websites: ['https://testprovider1.example.com'],
    description: 'Test provider for automated testing',
    demographics: ['All'],
    specificPopulations: ['General'],
    collaborationAndPartnerships: [],
    address: {
      streetAddress1: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zipCode: '90001'
    },
    contactInformation: [{
      officePhone: '555-0001',
      generalEmail: 'test1@example.com'
    }],
    servicesOffered: {
      available247: false,
      serviceCategories: ['Emergency Shelter'],
      languagesAvailable: ['English'],
      description: 'Test services',
      translationServices: false,
      feesAndPaymentOptions: ['Free']
    },
    crisisAndShelterServices: {
      immediateCrisisResponse: true,
      responseTime: '24 hours',
      emergencyShelter: true,
      emergencyShelterInfo: 'Available'
    }
  };

  // Create test provider 2
  const provider2 = {
    nonprofitName: 'Test Provider 2',
    businessType: ['Government'],
    regionsServed: ['Region C'],
    websites: ['https://testprovider2.example.com'],
    description: 'Another test provider for automated testing',
    demographics: ['Youth'],
    specificPopulations: ['Families'],
    collaborationAndPartnerships: [],
    address: {
      streetAddress1: '456 Test Ave',
      city: 'Test Town',
      state: 'NY',
      zipCode: '10001'
    },
    contactInformation: [{
      officePhone: '555-0002',
      generalEmail: 'test2@example.com'
    }],
    servicesOffered: {
      available247: true,
      serviceCategories: ['Long-term Services'],
      languagesAvailable: ['English', 'Spanish'],
      description: 'Long-term support services',
      translationServices: true,
      feesAndPaymentOptions: ['Sliding Scale']
    },
    crisisAndShelterServices: {
      immediateCrisisResponse: false,
      responseTime: '48 hours',
      emergencyShelter: false,
      emergencyShelterInfo: 'Not available'
    }
  };

  try {
    // Create provider 1
    const response1 = await page.request.post(`${baseURL}/api/providers`, {
      data: provider1,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (response1.ok()) {
      const data1 = await response1.json();
      createdIds.push(data1.id);
      console.log('Created test provider 1:', data1.id);
    } else {
      console.error('Failed to create provider 1:', await response1.text());
    }

    // Create provider 2
    const response2 = await page.request.post(`${baseURL}/api/providers`, {
      data: provider2,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (response2.ok()) {
      const data2 = await response2.json();
      createdIds.push(data2.id);
      console.log('Created test provider 2:', data2.id);
    } else {
      console.error('Failed to create provider 2:', await response2.text());
    }
  } catch (error) {
    console.error('Error creating test providers:', error);
  }

  return createdIds;
}

/**
 * Deletes test provider data via API
 * @param page - Playwright page object (used to get session cookies)
 * @param providerIds - Array of provider IDs to delete
 */
export async function deleteTestProviders(page: Page, providerIds: number[]): Promise<void> {
  const baseURL = process.env.VITE_APP_API_URL || 'http://localhost:3010';

  const sessionToken = await getSessionToken(page);

  if (!sessionToken) {
    console.error('No Supabase session found for cleanup');
    return;
  }

  for (const id of providerIds) {
    try {
      const response = await page.request.delete(`${baseURL}/api/providers/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (response.ok()) {
        console.log(`Deleted test provider ${id}`);
      } else {
        console.error(`Failed to delete provider ${id}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error deleting test provider ${id}:`, error);
    }
  }
}
