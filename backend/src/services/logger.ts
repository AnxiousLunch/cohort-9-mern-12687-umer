// Serves as a starting point for pino logger

import pino from "pino";

const logger = pino({
  level: 'info',
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
    censor: '[Redacted]',
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger