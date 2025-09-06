import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import PrinterConnection from './services/printerConnection';
import CommandQueue from './services/commandQueue';
import StatusMonitor from './services/statusMonitor';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Initialize services
// TODO: Make printer path and baud rate configurable (e.g., via environment variables or config file)
const printerConnection = new PrinterConnection(process.env.PRINTER_PORT || '/dev/ttyUSB0', parseInt(process.env.PRINTER_BAUD_RATE || '115200'));
const commandQueue = new CommandQueue(printerConnection);
const statusMonitor = new StatusMonitor(io, printerConnection, commandQueue);

// Connect to printer on startup
printerConnection.connect();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API endpoint to send G-code
app.post('/api/printer/command', async (req, res) => {
  const { command, priority } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required.' });
  }
  try {
    await commandQueue.enqueue(command, priority);
    res.json({ message: 'Command enqueued successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for emergency stop (M112)
app.post('/api/printer/emergency-stop', async (req, res) => {
  try {
    await commandQueue.enqueue('M112', -1); // M112 is emergency stop, give it highest priority
    res.json({ message: 'Emergency stop command sent.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down printer connection...');
  printerConnection.disconnect();
  process.exit();
});
