export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const isProd = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PROD : false;
let currentLevel: LogLevel = isProd ? 'warn' : 'debug';

export class Logger {
  private tag?: string;

  constructor(tag?: string) {
    this.tag = tag;
  }

  static setLevel(level: LogLevel): void {
    currentLevel = level;
  }

  static getLevel(): LogLevel {
    return currentLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  }

  private formatPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString().slice(11, 19);
    const tagPart = this.tag ? `[${this.tag}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${tagPart}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatPrefix('debug'), message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatPrefix('info'), message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatPrefix('warn'), message, ...args);
    }
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatPrefix('error'), message, error ?? '', ...args);
    }
  }

  withTag(tag: string): Logger {
    return new Logger(this.tag ? `${this.tag}:${tag}` : tag);
  }
}

export const logger = new Logger('App');
export default logger;
