import { EnvConfig } from '../config/env.validation';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}

export {};
