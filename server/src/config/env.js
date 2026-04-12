export const ENV = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
