import { ENV } from './env.js';

// En développement : tout autoriser pour éviter les blocages locaux
// En production : restreindre aux origines connues
export const corsOptions = ENV.isDev
  ? {
      origin: true,          // autorise TOUTES les origines en dev
      credentials: true,
    }
  : {
      origin: [
        ENV.CLIENT_URL,
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
        'https://videoconference-server-delta.vercel.app',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    };
