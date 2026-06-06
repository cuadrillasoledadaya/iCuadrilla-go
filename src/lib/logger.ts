const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) console.log('[iC]', ...args);
  },
  error: (...args: unknown[]) => {
    if (DEBUG) console.error('[iC]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) console.warn('[iC]', ...args);
  },
  info: (...args: unknown[]) => {
    if (DEBUG) console.info('[iC]', ...args);
  },
};
