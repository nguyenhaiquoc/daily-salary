import * as pino from "pino";

export const logger = pino.default({
  name: 'salary-hello',
  level: 'debug'
});
