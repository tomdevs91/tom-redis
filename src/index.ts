import { createClient, RedisClientType } from 'redis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class RedisManager {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    // Create Redis client with connection options
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return new Error('Max retry attempts reached');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    // Event listeners
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis server');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('Redis client is ready');
    });

    this.client.on('end', () => {
      console.log('Redis connection closed');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Basic Redis operations
  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      console.log(`Set key: ${key} = ${value}`);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      console.log(`Get key: ${key} = ${value}`);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      const result = await this.client.del(key);
      console.log(`Deleted key: ${key}, result: ${result}`);
      return result;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      throw error;
    }
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      const result = await this.client.hSet(key, field, value);
      console.log(`Hash set: ${key}.${field} = ${value}`);
      return result;
    } catch (error) {
      console.error(`Error setting hash ${key}.${field}:`, error);
      throw error;
    }
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      const value = await this.client.hGet(key, field);
      console.log(`Hash get: ${key}.${field} = ${value}`);
      return value;
    } catch (error) {
      console.error(`Error getting hash ${key}.${field}:`, error);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      const hash = await this.client.hGetAll(key);
      console.log(`Hash getAll: ${key} =`, hash);
      return hash;
    } catch (error) {
      console.error(`Error getting all hash fields for ${key}:`, error);
      throw error;
    }
  }

  // List operations
  async lPush(key: string, ...values: string[]): Promise<number> {
    try {
      const result = await this.client.lPush(key, values);
      console.log(`List push: ${key} <- [${values.join(', ')}]`);
      return result;
    } catch (error) {
      console.error(`Error pushing to list ${key}:`, error);
      throw error;
    }
  }

  async lPop(key: string): Promise<string | null> {
    try {
      const value = await this.client.lPop(key);
      console.log(`List pop: ${key} -> ${value}`);
      return value;
    } catch (error) {
      console.error(`Error popping from list ${key}:`, error);
      throw error;
    }
  }

  async lRange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    try {
      const list = await this.client.lRange(key, start, stop);
      console.log(`List range: ${key}[${start}:${stop}] =`, list);
      return list;
    } catch (error) {
      console.error(`Error getting list range ${key}:`, error);
      throw error;
    }
  }

  // Utility methods
  async ping(): Promise<string> {
    try {
      const response = await this.client.ping();
      console.log('Redis ping:', response);
      return response;
    } catch (error) {
      console.error('Error pinging Redis:', error);
      throw error;
    }
  }

  async flushAll(): Promise<string> {
    try {
      const response = await this.client.flushAll();
      console.log('Flushed all Redis data');
      return response;
    } catch (error) {
      console.error('Error flushing Redis:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Demo function to showcase Redis operations
async function demonstrateRedisOperations(): Promise<void> {
  const redis = new RedisManager();

  try {
    // Connect to Redis
    await redis.connect();

    // Test basic operations
    console.log('\n=== Basic String Operations ===');
    await redis.set('greeting', 'Hello, Redis!', 300); // Expires in 5 minutes
    const greeting = await redis.get('greeting');
    console.log('Retrieved greeting:', greeting);

    // Test hash operations
    console.log('\n=== Hash Operations ===');
    await redis.hSet('user:1', 'name', 'Tom');
    await redis.hSet('user:1', 'email', 'tom@example.com');
    await redis.hSet('user:1', 'age', '30');
    
    const userName = await redis.hGet('user:1', 'name');
    console.log('User name:', userName);
    
    const allUserData = await redis.hGetAll('user:1');
    console.log('All user data:', allUserData);

    // Test list operations
    console.log('\n=== List Operations ===');
    await redis.lPush('tasks', 'Learn Redis', 'Build project', 'Deploy to AWS');
    const tasks = await redis.lRange('tasks');
    console.log('All tasks:', tasks);
    
    const nextTask = await redis.lPop('tasks');
    console.log('Next task:', nextTask);

    // Test utility operations
    console.log('\n=== Utility Operations ===');
    const pingResponse = await redis.ping();
    console.log('Ping response:', pingResponse);

    const keyExists = await redis.exists('greeting');
    console.log('Greeting key exists:', keyExists);

    console.log('\n=== Redis Demo Complete ===');

  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    // Always disconnect
    await redis.disconnect();
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 Starting Tom\'s Redis Project');
  console.log('================================');
  
  try {
    await demonstrateRedisOperations();
  } catch (error) {
    console.error('Application failed:', error);
    process.exit(1);
  }
  
  console.log('\n✅ Application completed successfully');
}

// Export the RedisManager class for use in other modules
export { RedisManager };

// Run the demo if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
