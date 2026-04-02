import { sendPoolTask } from './WorkerPool';

/**
 * Legacy wrapper for the new multi-threaded WorkerPool.
 * Maintains the same API to avoid breaking existing hooks.
 */
export function sendWorkerMessage(type, payload) {
  return sendPoolTask(type, payload);
}

