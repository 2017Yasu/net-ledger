// src/lib/logger.ts

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogOptions {
  level?: LogLevel
  context?: string
  userId?: string
  recordId?: string
  [key: string]: any // Allow additional metadata
}

const log = (message: string, options?: LogOptions) => {
  const { level = LogLevel.INFO, context, userId, recordId, ...metadata } = options || {}
  const timestamp = new Date().toISOString()

  const logEntry = {
    timestamp,
    level,
    message,
    context,
    userId,
    recordId,
    ...metadata,
  }

  // In a production environment, this would send logs to a service like
  // Sentry, Datadog, ELK stack, etc.
  // For now, we'll log to the console.
  switch (level) {
    case LogLevel.ERROR:
      console.error(JSON.stringify(logEntry))
      break
    case LogLevel.WARN:
      console.warn(JSON.stringify(logEntry))
      break
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.debug(JSON.stringify(logEntry))
      }
      break
    case LogLevel.INFO:
    default:
      console.info(JSON.stringify(logEntry))
      break
  }
}

export const logger = {
  info: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: LogLevel.INFO }),
  warn: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: LogLevel.WARN }),
  error: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: LogLevel.ERROR }),
  debug: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: LogLevel.DEBUG }),
}

// Example usage:
// logger.info('User logged in', { userId: 'user123', context: 'Auth' });
// logger.error('Failed to create record', { userId: 'user456', recordId: 'temp', error: err.message });
