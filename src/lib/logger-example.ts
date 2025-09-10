/**
 * Logger Usage Example
 * This file demonstrates how to use the logger instead of console
 */

import { logger } from './logger';

// Example function that demonstrates logger usage
export function exampleFunction() {
  // Instead of console.log, use logger.log
  logger.log('Starting example function');
  
  // Instead of console.info, use logger.info
  logger.info('Processing user data');
  
  // Instead of console.warn, use logger.warn
  logger.warn('This is a warning message');
  
  // Instead of console.error, use logger.error
  logger.error('An error occurred');
  
  // Instead of console.debug, use logger.debug
  logger.debug('Debug information');
  
  // All other console methods are available
  logger.trace('Stack trace');
  logger.table({ name: 'John', age: 30 });
  logger.group('User Details');
  logger.log('Name: John Doe');
  logger.log('Email: john@example.com');
  logger.groupEnd();
  
  // Timing operations
  logger.time('data-processing');
  // ... some processing ...
  logger.timeEnd('data-processing');
  
  // Counting
  logger.count('function-calls');
  
  // Assertions
  logger.assert(true, 'This should pass');
  
  logger.log('Example function completed');
}

// Example of conditional logging
export function conditionalLogging() {
  // This will only log if logger is enabled and level allows it
  if (logger.isLoggerEnabled()) {
    logger.info('Logger is enabled, proceeding with detailed logging');
    
    // Detailed debug information
    logger.debug('User ID:', '12345');
    logger.debug('Session ID:', 'abc-def-ghi');
    logger.debug('Request headers:', { 'Content-Type': 'application/json' });
  } else {
    // Fallback to console if logger is disabled
    console.log('Logger is disabled, using console fallback');
  }
}

// Example of updating logger configuration
export function updateLoggerConfig() {
  // Enable/disable logging
  logger.enable();
  logger.disable();
  logger.toggle();
  
  // Update configuration
  logger.updateConfig({
    enabled: true,
    developmentOnly: false,
    prefix: '[MyApp]',
    timestamp: true,
    level: 'info'
  });
  
  // Get current configuration
  const config = logger.getConfig();
  logger.info('Current logger config:', config);
}
