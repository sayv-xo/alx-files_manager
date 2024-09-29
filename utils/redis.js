import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * A redis client class
 */
class RedisClient {
  constructor() {
    this.client = createClient();
    this.clientConnected = true;
    this.client.on('error', (error) => {
      console.error(error);
      this.clientConnected = false;
    });
    this.client.on('connect', () => {
      this.clientConnected = true;
    });
  }

  isAlive() {
    return this.clientConnected;
  }

  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, duration) {
    promisify(this.client.SETEX).bind(this.client)(key, duration, value);
  }

  async del(key) {
    promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
