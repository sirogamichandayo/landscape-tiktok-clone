import { addTestData, clearTestData } from '../testData';

describe('Test Data Management', () => {
  beforeEach(async () => {
    // Clear existing test data before each test
    await clearTestData();
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