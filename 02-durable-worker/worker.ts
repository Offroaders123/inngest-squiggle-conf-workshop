import { type Item, QueueClient } from '../lib/queue';
import { logger } from '../lib/logger';
import { handler, StepFunction } from './handler';

const POLL_INTERVAL = 1_000; // ms

const queue = new QueueClient();

export async function worker() {
  /*
   * HINT: Memoized state should exist outside of the loop
   */

  const state: Record<string, Item> = {};

  while (true) {
    const event = await queue.dequeue().catch((err) => {
      logger.error(`Failed to fetch from queue: ${err}`);
      return null;
    });

    if (event) {
      logger.info(`Processing queue item:`, event.id);

      const step: StepFunction<Item> = async (id, callback) => {
        // Your code will go here!
        const key: string = `${event.id}:${id}`;

        if (state[key]) {
          return state[key];
        }

        state[key] = event;

        return callback();
      }

      try {
        await handler({ event, step });
        logger.info('✅ Success!');
      } catch (err) {
        logger.error(`Processing failed: ${err}`);
        // re-queue failed work
        await queue.enqueue(event);
      }
    } else {
      logger.info('No queue items available');
    }

    await new Promise((res) => setTimeout(res, POLL_INTERVAL));
  }
}
