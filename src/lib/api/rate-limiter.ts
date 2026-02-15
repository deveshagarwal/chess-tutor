export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private lastRequestTime: number = 0;
  private minDelay: number;
  private maxRetries: number;

  constructor(requestsPerMinute: number, maxRetries: number = 3) {
    this.minDelay = (60 * 1000) / requestsPerMinute;
    this.maxRetries = maxRetries;
  }

  /**
   * Add request to queue
   */
  async request<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.executeWithRetry(fn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries < this.maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await this.sleep(delay);
        return this.executeWithRetry(fn, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Process the request queue
   */
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Wait for minimum delay since last request
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelay) {
      await this.sleep(this.minDelay - timeSinceLastRequest);
    }

    // Execute next request
    const request = this.queue.shift();
    if (request) {
      this.lastRequestTime = Date.now();
      await request();
    }

    // Process next in queue
    this.processQueue();
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }
}
