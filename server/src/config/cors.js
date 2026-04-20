import { ENV } from './env.js';

export const corsOptions = ENV.isDev
  ? {
      origin: true,
      credentials: true,
    }
  : {
      origin: [
        ENV.CLIENT_URL,
        'https://videoconferencepro-client-nine.vercel.app',
        'https://videoconference-server-delta.vercel.app',
      ].filter(Boolean),
      credentials: true,
    };

export const socketCorsOptions = ENV.isDev
  ? {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  : {
      origin: [
        ENV.CLIENT_URL,
        'https://videoconferencepro-client-nine.vercel.app',
        'https://videoconference-server-delta.vercel.app',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    };
