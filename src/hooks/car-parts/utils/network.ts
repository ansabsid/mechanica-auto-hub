
// Network utility functions for timeout and retry functionality

const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

/**
 * Wraps a promise with a timeout and retry mechanism
 * @param promise The original promise to execute
 * @param retryCount Current retry attempt (internal use)
 * @returns The result of the promise, or throws after max retries
 */
export const fetchWithTimeout = async (promise: Promise<any>, retryCount = 0) => {
  let timeoutId: NodeJS.Timeout;
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, FETCH_TIMEOUT);
    });

    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`);
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return fetchWithTimeout(promise, retryCount + 1);
    }
    
    throw error;
  }
};
