import { Application } from './app/Application.js';

/**
 * Application Entry Point
 * Bootstrap and start the 3D Printer Control API
 */
async function main(): Promise<void> {
  try {
    // Create application instance
    const app = new Application();

    // Initialize all dependencies
    await app.initialize();

    // Start the server
    await app.start();

    console.log('🚀 3D Printer Control API started successfully!');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
