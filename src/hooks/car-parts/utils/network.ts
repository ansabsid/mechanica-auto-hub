
// Network utility functions for timeout and retry functionality

const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

/**
 * Wraps a promise with a timeout and retry mechanism
 * @param promiseFn The original promise function to execute
 * @param retryCount Current retry attempt (internal use)
 * @returns The result of the promise, or throws after max retries
 */
export const fetchWithTimeout = async <T>(promiseFn: () => Promise<T> | any, retryCount = 0): Promise<T> => {
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
      // Use exponential backoff strategy for retries
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return fetchWithTimeout(promiseFn, retryCount + 1);
    }
    
    throw error;
  }
};

// Add a new cache utility to prevent duplicate requests
const responseCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 60000; // 1 minute cache TTL

/**
 * Fetches data with caching to prevent redundant network requests
 * @param cacheKey A unique key to identify this request in cache
 * @param fetchFn The fetch function to execute if cache miss
 * @param ttl Optional TTL in ms (defaults to 1 minute)
 */
export const fetchWithCache = async <T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> => {
  const now = Date.now();
  const cached = responseCache.get(cacheKey);
  
  // Return cached data if it exists and is not expired
  if (cached && (now - cached.timestamp < ttl)) {
    console.log(`🔄 Using cached data for: ${cacheKey}`);
    return cached.data as T;
  }
  
  // Fetch fresh data
  console.log(`🌐 Fetching fresh data for: ${cacheKey}`);
  const data = await fetchWithTimeout(fetchFn);
  
  // Type safety: ensure data is of type T before caching
  // This cast is necessary because TypeScript can't infer the runtime type
  const typedData = data as T;
  
  // Store in cache
  responseCache.set(cacheKey, {
    data: typedData,
    timestamp: now
  });
  
  return typedData;
};
