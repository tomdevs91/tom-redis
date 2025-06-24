# Tom Redis - TypeScript Redis Starter Project

A comprehensive Redis-based TypeScript starter project with full Redis operations support and proper error handling.

## Features

- **Full Redis Operations**: String, Hash, List operations with comprehensive methods
- **TypeScript**: Strict TypeScript configuration with type safety
- **Connection Management**: Robust Redis connection handling with retry logic
- **Error Handling**: Comprehensive error handling and logging
- **Environment Configuration**: Flexible Redis connection via environment variables
- **Demo Included**: Complete demonstration of all Redis operations

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Redis server running locally or accessible via URL

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Redis connection details

# Build the project
npm run build

# Run the demo
npm start

# Or run in development mode
npm run dev
```

### Redis Setup

#### Local Redis (Ubuntu/WSL)
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test Redis
redis-cli ping  # Should return PONG
```

#### Using Docker
```bash
# Run Redis container
docker run -d --name redis-server -p 6379:6379 redis:7-alpine
```

## Project Structure

```
tom-redis/
├── src/
│   └── index.ts          # Main Redis manager and demo
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Redis Operations Supported

### String Operations
- `set(key, value, expireInSeconds?)` - Set key-value with optional expiration
- `get(key)` - Get value by key
- `delete(key)` - Delete key
- `exists(key)` - Check if key exists

### Hash Operations
- `hSet(key, field, value)` - Set hash field
- `hGet(key, field)` - Get hash field value
- `hGetAll(key)` - Get all hash fields and values

### List Operations
- `lPush(key, ...values)` - Push values to list
- `lPop(key)` - Pop value from list
- `lRange(key, start, stop)` - Get list range

### Utility Operations
- `ping()` - Test Redis connection
- `flushAll()` - Clear all Redis data (use with caution)
- `getConnectionStatus()` - Check connection status

## Configuration

Edit `.env` file to configure Redis connection:

```env
# Local Redis
REDIS_URL=redis://localhost:6379

# Redis with authentication
REDIS_URL=redis://username:password@hostname:port

# Redis with SSL/TLS
REDIS_URL=rediss://username:password@hostname:port

# Redis Cloud
REDIS_URL=redis://default:password@hostname:port
```

## Usage Examples

```typescript
import { RedisManager } from './src/index';

const redis = new RedisManager();

async function example() {
  await redis.connect();
  
  // String operations
  await redis.set('user_count', '100', 3600); // Expires in 1 hour
  const count = await redis.get('user_count');
  
  // Hash operations
  await redis.hSet('user:123', 'name', 'Tom');
  await redis.hSet('user:123', 'email', 'tom@example.com');
  const userData = await redis.hGetAll('user:123');
  
  // List operations
  await redis.lPush('notifications', 'Welcome!', 'Check your profile');
  const notifications = await redis.lRange('notifications');
  
  await redis.disconnect();
}
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript
- `npm run dev` - Run with ts-node for development
- `npm run watch` - Watch for changes and recompile
- `npm run clean` - Remove compiled files

## Development Notes

- The project uses strict TypeScript configuration for better code quality
- All Redis operations include proper error handling and logging
- Connection retry logic handles temporary Redis server issues
- Environment variables allow easy configuration for different environments

## Deployment

This project is ready for deployment. Configure your production Redis instance in the environment variables and build the project:

```bash
npm run build
NODE_ENV=production npm start
```

## Contributing

Feel free to enhance this starter project with additional Redis operations or features as needed.

## License

MIT License - feel free to use this starter project for your own Redis-based applications.
