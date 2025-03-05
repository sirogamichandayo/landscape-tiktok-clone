import { addTestData, clearTestData } from '../testData';

describe('Test Data Management', () => {
  jest.setTimeout(30000); // Increase timeout to 30 seconds

  beforeEach(async () => {
    try {
      // Clear existing test data before each test
      await clearTestData();
    } catch (error) {
      console.error('Failed to clear test data:', error);
      throw error;
    }
  });

  it('should add test data successfully', async () => {
    console.log('[DEBUG_LOG] Starting test data insertion...');

    // Add test data
    const result = await addTestData();

    // Log the results
    console.log('[DEBUG_LOG] Test users created:', result.users.length);
    console.log('[DEBUG_LOG] Test videos added:', result.videos.length);

    // Basic assertions
    expect(result.users).toBeDefined();
    expect(result.videos).toBeDefined();
    expect(result.videos.length).toBeGreaterThan(0);

    // Log sample data
    console.log('[DEBUG_LOG] Sample video:', result.videos[0]);
  });
});
