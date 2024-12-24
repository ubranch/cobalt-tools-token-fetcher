"use strict";

const Fastify = require("fastify");
const { fetchToken } = require("./main");

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  trustProxy: true
});

const schema = {
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['success'] },
        token: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' }
      },
      required: ['status', 'token', 'timestamp', 'expiresAt']
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['error'] },
        error: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      },
      required: ['status', 'error', 'timestamp']
    }
  }
};

// Rate limiting to prevent abuse
fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute'
});

// CORS configuration
fastify.register(require('@fastify/cors'), {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
  methods: ['GET']
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Token fetching endpoint
fastify.get('/api/v1/token', {
  schema,
  handler: async (request, reply) => {
    request.log.info('Starting token fetch process');

    try {
      const result = await fetchToken();

      if (!result.token) {
        throw new Error('Failed to fetch token');
      }

      return {
        status: 'success',
        token: result.token,
        timestamp: new Date().toISOString(),
        expiresAt: result.expiresAt
      };
    } catch (error) {
      request.log.error(error, 'Token fetch failed');

      reply.status(500).send({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error, 'Unhandled error');

  reply.status(500).send({
    status: 'error',
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal to terminate: ${signal}`);
  await fastify.cleanup();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Server startup
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
