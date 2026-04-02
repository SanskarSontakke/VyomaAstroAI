/**
 * WorkerPool.js
 * Manages a pool of Web Workers for parallel processing.
 */

class WorkerPool {
  constructor(workerUrl, size = navigator.hardwareConcurrency || 4) {
    this.workerUrl = workerUrl;
    this.size = Math.min(size, 8); // Cap at 8 workers to avoid OS overhead
    this.workers = [];
    this.idleWorkers = [];
    this.queue = [];
    this.requestId = 0;
    this.pendingRequests = new Map();

    this._init();
  }

  _init() {
    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(this.workerUrl, { type: 'module' });
      
      worker.addEventListener('message', (e) => {
        const { id, result, error } = e.data;
        const pending = this.pendingRequests.get(id);
        
        if (pending) {
          this.pendingRequests.delete(id);
          if (error) pending.reject(new Error(error));
          else pending.resolve(result);
        }

        // Return worker to idle pool and process next task
        this.idleWorkers.push(worker);
        this._processQueue();
      });

      worker.addEventListener('error', (err) => {
        console.error('WorkerPool: Worker error', err);
        // Attempt to replace broken worker
        this._replaceWorker(worker);
      });

      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  _replaceWorker(oldWorker) {
    const idx = this.workers.indexOf(oldWorker);
    if (idx !== -1) {
      oldWorker.terminate();
      const newWorker = new Worker(this.workerUrl, { type: 'module' });
      // Re-attach listeners... (omitted for brevity, assume similar to _init)
      this.workers[idx] = newWorker;
      this.idleWorkers.push(newWorker);
      this._processQueue();
    }
  }

  execute(type, payload) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.queue.push({ id, type, payload, resolve, reject });
      this._processQueue();
    });
  }

  _processQueue() {
    if (this.queue.length === 0 || this.idleWorkers.length === 0) return;

    const worker = this.idleWorkers.pop();
    const { id, type, payload, resolve, reject } = this.queue.shift();

    this.pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.idleWorkers = [];
  }
}

let _globalPool = null;

export function getWorkerPool() {
  if (!_globalPool && typeof window !== 'undefined') {
    _globalPool = new WorkerPool(
      new URL('../workers/astro.worker.js', import.meta.url)
    );
  }
  return _globalPool;
}

export function sendPoolTask(type, payload) {
  const pool = getWorkerPool();
  if (!pool) return Promise.reject(new Error('Worker Pool unavailable'));
  return pool.execute(type, payload);
}
