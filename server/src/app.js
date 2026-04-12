import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import * as roomService from './rooms/roomService.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());

  // Health check
  app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

  // POST /api/rooms — créer une salle
  app.post('/api/rooms', (req, res) => {
    try {
      const room = roomService.createRoom();
      logger.info('Room created:', room.id);
      res.json({ roomId: room.id });
    } catch (err) {
      logger.error('createRoom error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/rooms/:roomId — vérifier si une salle existe
  app.get('/api/rooms/:roomId', (req, res) => {
    try {
      const info = roomService.getRoomInfo(req.params.roomId);
      if (info) {
        res.json({ exists: true, ...info });
      } else {
        res.json({ exists: false });
      }
    } catch (err) {
      logger.error('getRoomInfo error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
