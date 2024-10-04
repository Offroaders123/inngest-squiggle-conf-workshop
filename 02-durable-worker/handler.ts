import ai from '../lib/ai';
import crm from '../lib/crm';
import { template, emailAPI } from '../lib/email';
import type { Item } from '../lib/queue.js';

export interface HandlerEntry {
  event: Item;
  step: StepFunction;
}

export type StepFunction = <T>(id: string, callback: () => Promise<T>) => Promise<T>;

export async function handler({ event, step }: HandlerEntry): Promise<void> {
  const { user, signupSurvey } = event.data;

  const personalizedMessage = await step('generate-msg', async () => {
    return await ai.slowLLM(user, signupSurvey);
  });

  const emailBody = await template.compile(
    'welcome_email',
    personalizedMessage
  );

  await emailAPI.send(user, emailBody);

  await crm.addCustomer(user);
}
