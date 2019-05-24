import { Client } from 'elasticsearch';

import { elasticHost } from './config';
import { exchange, getChannel, topic } from './queue';

const client = new Client({ host: elasticHost });

const checkedIndexes = {};

export async function sendMessageToQueue (message): Promise<boolean> {

    if (!message || !message.event.context) {
        throw new Error('invalid payload');
    }

    if (message.event.context.split('.').length !== 3) {
        throw new Error('invalid context format');
    }

    const channel = await getChannel();

    const serializedMessage = JSON.stringify(message);

    return channel.publish(exchange, topic, Buffer.from(serializedMessage));
}

export async function storeEvent(eventData: any): Promise<any> {
    const index = `judas_${eventData.event.app}`;

    await ensureElasticIndex(index);

    await client.index({
        index,
        type: 'judas',
        body: eventData
    });
}

async function ensureElasticIndex(index: string): Promise<void> {

    if (checkedIndexes[index]) {
        return;
    }

    const exists = await client.indices.exists({ index });

    if (!exists) {
        await createIndex(index);
    }

    checkedIndexes[index] = true;
}

async function createIndex(index): Promise<void> {
    await client.indices.create({
      index,
      body: {
        settings: {
          number_of_shards: 5,
          number_of_replicas: 1
        },
        mappings: {
          judas: {
            properties: {
              event: {
                properties: {
                  date:  { "type": "date", "index": true },
                  processed_at: { "type": "date", "index": true },
                  context: { "type": "keyword", "index": true },
                  environment: { "type": "keyword", "index": true },
                  app: { "type": "keyword", "index": true },
                  module: { "type": "keyword", "index": true },
                  action: { "type": "keyword", "index": true },
                  hostname: { "type": "keyword", "index": true },
                  delay: { "type": "integer", "index": true }
                }
              }
            }
          }
        }
      }
    });
    
    console.log(`created index: ${index}`);
  }