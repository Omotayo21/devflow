import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => logger.error({ err }, 'Redis error'));
client.on('connect', () => logger.info('Redis connected'));

await client.connect();

export default client;