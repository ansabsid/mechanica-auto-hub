
// Network utility functions for timeout and retry functionality

const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

/**
 * Wraps a promise with a timeout and retry mechanism
 * @param promise The original promise to execute
 * @param retryCount Current retry attempt (internal use)
 * @returns The result of the promise, or throws after max retries
 */
export const fetchWithTimeout = async <T>(promiseFn: () => Promise<T>, retryCount = 0): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  try {
    // Create the actual promise we want to run
    const promise = promiseFn();
    
    // Create a timeout promise that will reject after FETCH_TIMEOUT ms
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, FETCH_TIMEOUT);
    });

    // Race the real promise against the timeout
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`);
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return fetchWithTimeout(promiseFn, retryCount + 1);
    }
    
    throw error;
  }
};
