import { Router } from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/file.controller';
// Assuming you will have an authentication middleware
// import { authenticateToken } from '../middleware/auth.middleware'; 

const router = Router();

// Apply authentication middleware to all file routes
// router.use(authenticateToken);

router.post('/upload', uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

export default router;
