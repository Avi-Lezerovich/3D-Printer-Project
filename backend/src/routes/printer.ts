import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = Router();

// Get printer status
router.get('/status', authenticateJWT, requirePermission('printer.read'), async (_req, res) => {
  // In a real application, you would fetch the printer's status from a service.
  // For now, we'll return a mock status.
  const printerStatus = {
    state: 'idle',
    temperature: {
      tool0: { actual: 25.3, target: 0 },
      bed: { actual: 25.1, target: 0 },
    },
    progress: {
      completion: 0,
      filepos: 0,
      printTime: 0,
      printTimeLeft: 0,
    },
  };

  res.json(printerStatus);
});

export default router;
