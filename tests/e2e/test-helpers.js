/**
 * Test Helper Functions
 * Shared utilities for E2E tests
 */

/**
 * Make API request with exponential backoff retry for rate limiting
 */
export async function makeApiRequestWithRetry(request, url, payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await request.post(url, { data: payload });

      if (response.status() === 429) {
        // Rate limited, wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`API request failed after ${maxRetries} retries`);
}

/**
 * Add delay between tests to reduce rate limiting
 */
export async function addTestDelay(ms = 500) {
  await new Promise(resolve => setTimeout(resolve, ms));
}