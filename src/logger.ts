import * as pino from 'pino';

const logger = pino.default({
  name: 'salary-hello',
  level: 'debug',
});

export { logger };
