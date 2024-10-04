import { createId } from './ids';

export interface Item {
  id?: string;
  name: string;
  data: {
    user: {
      id: string;
      name: string;
      company: string;
    };
    signupSurvey: {
      teamSize: string;
      industry: string;
    };
  };
}

export class QueueClient {
  baseURL = 'http://localhost:4040';

  async enqueue(item: Item): Promise<void> {
    // Append ID if not a job that is requeued
    if (!item.id) {
      item.id = createId();
    }
    const url = new URL('/enqueue', this.baseURL);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    // TODO - Handle error
    // const json = await response.json();
  }

  async dequeue(): Promise<Item | undefined> {
    const url = new URL('/dequeue', this.baseURL);
    const response = await fetch(url, {
      method: 'POST',
    });
    const json = await response.json();
    return json?.item as Item;
  }
}
