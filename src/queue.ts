import { rabbitHost, prefetch } from "./config";
import * as amqp from 'amqplib'
import * as Bluebird from 'bluebird';

export const exchange = 'eduzz';
export const topic = `judas.log`
const nackTopic = `judas.log_nack`;

const queue = `judas.log`;
const nackQueue = `judas.log.nack`;

let conn: Bluebird<amqp.Connection> = null;
let channel: Promise<amqp.Channel> = null;

export const getConnection = async(): Promise<amqp.Connection> => {
  if (!conn) {
    conn = amqp.connect(rabbitHost);
  }

  return conn;
}

export const getChannel = async (): Promise<amqp.Channel> => {
  if (!channel) {
    channel = makeChannel();
  }

  return channel;
}

export const listen = async (callback) => {
  const ch = await getChannel();

  await ch.assertExchange(exchange, 'topic', { durable: true });
  await ch.prefetch(prefetch);

  await ch.assertQueue(nackQueue, { durable: true, arguments: {
    'x-dead-letter-exchange': exchange,
    'x-dead-letter-routing-key': topic,
    'x-message-ttl': 60000
  }});
  await ch.bindQueue(nackQueue, exchange, nackTopic);

  const q = await ch.assertQueue(queue, { durable: true, arguments: {
    'x-dead-letter-exchange': exchange,
    'x-dead-letter-routing-key': nackTopic
  }});
  await ch.bindQueue(queue, exchange, topic);

  await ch.consume(q.queue, async (msg) => {
    try {
      const payload = msg.content;
      const parsed = JSON.parse(payload.toString());

      await callback(parsed);
      ch.ack(msg);
    } catch (err) {
      ch.nack(msg, false, false);
    }
  }, { noAck: false });
}

const makeChannel = async (): Promise<amqp.Channel> => {
  const conn = await getConnection();
  const ch = await conn.createChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  await ch.prefetch(prefetch);

  return ch;
}