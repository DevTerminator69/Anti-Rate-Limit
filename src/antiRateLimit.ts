export interface RateLimiterOptions {
    maxRequests: number;
    interval: number; // in milliseconds
    concurrency?: number; // Max tasks processed simultaneously
    retryLimit?: number; // Retry limit for failed tasks
  }
  
  export interface Task<T> {
    id: string;
    execute: () => Promise<T>;
    priority?: number; // Higher priority tasks processed first
  }
  
  // Internal task type to include additional properties
  interface InternalTask<T> extends Task<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    retries: number;
  }
  
  export class AntiRateLimit {
    private maxRequests: number;
    private interval: number;
    private concurrency: number;
    private retryLimit: number;
    private queue: InternalTask<any>[] = [];
    private activeTasks: number = 0;
    private requestCount: number = 0;
  
    constructor(options: RateLimiterOptions) {
      this.maxRequests = options.maxRequests;
      this.interval = options.interval;
      this.concurrency = options.concurrency || 1;
      this.retryLimit = options.retryLimit || 3;
  
      // Reset request count periodically
      setInterval(() => {
        this.requestCount = 0;
        this.processQueue();
      }, this.interval);
    }
  
    public async addTask<T>(task: Task<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        const wrappedTask: InternalTask<T> = {
          ...task,
          resolve,
          reject,
          retries: 0,
        };
  
        this.queue.push(wrappedTask);
        this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Higher priority first
        this.processQueue();
      });
    }
  
    private async processQueue(): Promise<void> {
      while (
        this.queue.length > 0 &&
        this.activeTasks < this.concurrency &&
        this.requestCount < this.maxRequests
      ) {
        const task = this.queue.shift();
  
        if (!task) return;
  
        this.activeTasks++;
        this.requestCount++;
  
        try {
          const result = await task.execute();
          task.resolve(result);
        } catch (error) {
          if (task.retries < this.retryLimit) {
            task.retries++;
            this.queue.push(task); // Retry failed task
          } else {
            task.reject(error);
          }
        } finally {
          this.activeTasks--;
          this.processQueue();
        }
      }
    }
  }
  