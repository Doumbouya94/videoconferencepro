import { ENV } from '../config/env.js';

const colors = {
  reset: '\x1b[0m',
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
  success: '\x1b[32m',// green
};

const timestamp = () => new Date().toISOString();

export const logger = {
  info:  (...args) => console.log(`${colors.info}[INFO]${colors.reset}`, timestamp(), ...args),
  warn:  (...args) => console.warn(`${colors.warn}[WARN]${colors.reset}`, timestamp(), ...args),
  error: (...args) => console.error(`${colors.error}[ERROR]${colors.reset}`, timestamp(), ...args),
  debug: (...args) => ENV.isDev && console.log(`${colors.debug}[DEBUG]${colors.reset}`, timestamp(), ...args),
  success: (...args) => console.log(`${colors.success}[OK]${colors.reset}`, timestamp(), ...args),
  socket: (event, data) => ENV.isDev && console.log(`${colors.info}[SOCKET]${colors.reset}`, timestamp(), `📡 ${event}`, data || ''),
};
