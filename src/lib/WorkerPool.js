/**
 * WorkerPool.js
 * Manages a pool of Web Workers for parallel processing.
 */

class WorkerPool {
  constructor(workerUrl) {
    this.workerUrl = workerUrl;
    const deviceMemory = navigator.deviceMemory || 4;
    const concurrency = navigator.hardwareConcurrency || 4;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const maxWorkers = (() => {
      if (deviceMemory <= 2 || isMobile) return 1;
      if (deviceMemory <= 4) return 2;
      return Math.max(2, Math.min(concurrency, 4));
    })();

    this.size = maxWorkers;
    
    this.workers = [];
    this.idleWorkers = [];
    this.queue = [];
    this.requestId = 0;
    this.pendingRequests = new Map();

    this._init();
  }

  _init() {
    for (let i = 0; i < this.size; i++) {
      this._createWorker(i);
    }
  }

  _createWorker(index) {
    const worker = new Worker(this.workerUrl, { type: 'module' });
    
    const messageHandler = (e) => {
      const { id, result, error } = e.data;
      const pending = this.pendingRequests.get(id);
      
      if (pending) {
        this.pendingRequests.delete(id);
        if (error) pending.reject(new Error(error));
        else pending.resolve(result);
      }

      worker.currentTaskId = null;
      this.idleWorkers.push(worker);
      this._processQueue();
    };

    const errorHandler = (err) => {
      console.error(`WorkerPool: Worker ${index} error (possible crash/OOM)`, err);
      
      if (worker.currentTaskId) {
        const pending = this.pendingRequests.get(worker.currentTaskId);
        if (pending) {
          const { type, payload, resolve, reject, retries = 0 } = pending;
          this.pendingRequests.delete(worker.currentTaskId);

          if (retries < 1) {
            // Retry once on a fresh worker before failing.
            const retryId = ++this.requestId;
            this.queue.unshift({ id: retryId, type, payload, resolve, reject, retries: retries + 1 });
          } else {
            reject(new Error('Web Worker crashed during execution. This may be due to a memory limit or complex calculation.'));
          }
        }
      }

      this._replaceWorker(worker, index);
    };

    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    worker.currentTaskId = null;
    this.workers[index] = worker;
    this.idleWorkers.push(worker);
  }

  _replaceWorker(oldWorker, index) {
    try {
      oldWorker.terminate();
    } catch {
      // Ignore termination errors
    }
    
    // Remove from idle pool if it was there
    const idleIdx = this.idleWorkers.indexOf(oldWorker);
    if (idleIdx !== -1) {
      this.idleWorkers.splice(idleIdx, 1);
    }

    this._createWorker(index);
    this._processQueue();
  }

  execute(type, payload) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.queue.push({ id, type, payload, resolve, reject, retries: 0 });
      this._processQueue();
    });
  }

  _processQueue() {
    while (this.queue.length > 0 && this.idleWorkers.length > 0) {
      const worker = this.idleWorkers.pop();
      const { id, type, payload, resolve, reject, retries = 0 } = this.queue.shift();

      this.pendingRequests.set(id, { type, payload, resolve, reject, retries });
      worker.currentTaskId = id;
      worker.postMessage({ id, type, payload });
    }
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.idleWorkers = [];
    this.queue = [];
    this.pendingRequests.clear();
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
