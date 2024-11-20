# Anti-Rate-Limit

`anti-rate-limit` is a flexible and efficient task queue rate-limiter for Node.js, designed to manage and throttle task execution with configurable rate limits. It allows you to process tasks with a maximum number of requests per interval, concurrency control, and automatic retries for failed tasks.

This package is useful in scenarios like API rate limiting, background task processing, and controlling the load on resources.

---

## Features

- **Rate Limiting**: Control the number of tasks that can be processed within a defined time window.
- **Concurrency Control**: Define how many tasks can run concurrently.
- **Task Prioritization**: Execute high-priority tasks before lower-priority ones.
- **Automatic Retries**: Retry failed tasks up to a configurable retry limit.
- **Promise-based API**: Task execution is handled via async functions.

---

## Installation

To install `anti-rate-limit` in your Node.js project, use npm or yarn:

```bash
npm install anti-rate-limit
```

Or with yarn:

```bash
yarn add anti-rate-limit
```

---

## Usage

### Basic Example

Here’s a simple example showing how to use `anti-rate-limit` for basic rate-limiting.

#### `app.js`

```javascript
const { AntiRateLimit } = require('anti-rate-limit');

// Initialize the rate limiter
const rateLimiter = new AntiRateLimit({
  maxRequests: 5,      // Max 5 tasks per interval
  interval: 1000,      // 1-second interval
  concurrency: 2,      // 2 tasks can run simultaneously
  retryLimit: 3        // Retry failed tasks up to 3 times
});

// Add a simple task
rateLimiter.addTask({
  id: 'task1',
  execute: async () => {
    console.log('Executing task1');
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 300));
  }
});
```

### Adding Multiple Tasks

You can add multiple tasks in sequence, and they will be executed within the constraints of the rate limiter.

#### Example

```javascript
// Add multiple tasks
for (let i = 2; i <= 6; i++) {
  rateLimiter.addTask({
    id: `task${i}`,
    execute: async () => {
      console.log(`Executing task${i}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  });
}
```

### Adding Tasks with Logs

If you want to execute simple tasks like logging, you can define them inline:

```javascript
rateLimiter.addTask({
  id: 'task2',
  execute: async () => {
    console.log('Executing task2');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
});
```

### Task Priority

Tasks with higher priority are processed first. If you want to control the order of execution, you can specify a `priority` value.

#### Example: Priority-Based Task Execution

```javascript
rateLimiter.addTask({
  id: 'highPriorityTask',
  priority: 10,  // Higher priority
  execute: async () => {
    console.log('Executing high priority task');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
});

rateLimiter.addTask({
  id: 'lowPriorityTask',
  priority: 1,   // Lower priority
  execute: async () => {
    console.log('Executing low priority task');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
});
```

In this case, `highPriorityTask` will execute before `lowPriorityTask`, regardless of when they were added to the queue.

### Task Execution with Failures and Retries

Tasks that fail can be retried automatically up to a specified limit. If a task exceeds the retry limit, an error is thrown.

#### Example: Task with Failure and Retry

```javascript
rateLimiter.addTask({
  id: 'taskWithError',
  execute: async () => {
    console.log('Task with error is executing');
    throw new Error('Task failed');
  }
}).catch((err) => {
  console.error('Task failed after retries:', err);
});
```

The task will be retried up to 3 times (as specified by `retryLimit`), and if it still fails, it will be rejected with an error message.

---

## API

### `AntiRateLimit`

The main class used to create and manage the rate-limiting queue.

#### Constructor

```javascript
new AntiRateLimit(options)
```

- **options**: An object containing configuration options:
  - `maxRequests`: The maximum number of tasks that can be executed within the `interval` (default: 10).
  - `interval`: The time window for rate-limiting in milliseconds (default: 1000).
  - `concurrency`: The number of tasks that can run concurrently (default: 1).
  - `retryLimit`: The number of retries allowed for a failed task (default: 3).

#### Methods

- **`addTask(task)`**: Adds a new task to the queue.
  - **task**: An object with the following properties:
    - `id`: A unique identifier for the task.
    - `priority` (optional): A number to define the task's priority (higher numbers execute first).
    - `execute`: An async function that will be executed as the task's logic.

- **`task.execute()`**: The `execute` function must return a `Promise`. This function contains the logic that the rate limiter will manage.

---

## Advanced Use Cases

### Simultaneous Task Execution

If you want to add a group of tasks and run them simultaneously (up to the maximum allowed by `concurrency`), you can:

```javascript
const tasks = [1, 2, 3, 4, 5].map((i) => ({
  id: `simultaneousTask${i}`,
  execute: async () => {
    console.log(`Executing task${i}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}));

tasks.forEach(task => rateLimiter.addTask(task));
```

In this example, tasks `task1` to `task5` will execute simultaneously, but only two at a time, as specified by the `concurrency` option.

### Complex Async Work (API Requests, DB Calls)

`anti-rate-limit` can also be used for more complex tasks like API calls or database queries.

#### Example: Simulated API Request

```javascript
rateLimiter.addTask({
  id: 'apiRequestTask',
  execute: async () => {
    console.log('Making API request...');
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log('Received API data:', data);
  }
});
```

In this example, the `execute` function performs an async API request and logs the response.

---

## Error Handling & Retries

If a task fails, it will be retried up to the number of times specified by the `retryLimit`. If the task fails after reaching the retry limit, an error is thrown.

### Example with Error Handling

```javascript
rateLimiter.addTask({
  id: 'taskWithError',
  execute: async () => {
    throw new Error('Task failed');
  }
}).catch((err) => {
  console.error('Task failed after retries:', err);
});
```

---

## Contributing

We welcome contributions! If you'd like to contribute to this project, please fork the repository and submit a pull request. 

### Steps to contribute:
1. Fork this repository
2. Clone your fork: `git clone https://github.com/your-username/anti-rate-limit.git`
3. Create a new branch: `git checkout -b feature-branch`
4. Make your changes
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to your fork: `git push origin feature-branch`
7. Submit a pull request

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/DevTerminator69/Anti-Rate-Limit/blob/main/LICENSE) file for details.

---

## Contact

For any issues or feature requests, please open an issue on GitHub or contact us directly.

---

### Notes:

- **Flexibility**: You can easily adapt the rate limiter to fit your specific needs by tweaking the configuration options.
- **Robustness**: With retry limits and concurrency control, this package helps ensure that your application can handle high loads and failures gracefully.

---
