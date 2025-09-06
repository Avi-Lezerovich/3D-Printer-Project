import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma'; // Assuming you'll create a prisma client utility
import sharp from 'sharp';

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Basic file type validation
    if (file.mimetype === 'application/octet-stream' || file.originalname.endsWith('.stl') || file.originalname.endsWith('.gcode')) {
      cb(null, true);
    } else {
      cb(new Error('Only STL and G-code files are allowed!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 50 } // 50MB limit
});

export const uploadFile = async (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    const userId = (req as any).user?.userId; // Assuming user ID is available from authentication middleware

    if (!userId) {
      // If no user ID, delete the uploaded file and return error
      fs.unlinkSync(filePath);
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      // Save file metadata to database
      const newFile = await prisma.file.create({
        data: {
          userId: userId,
          originalName: originalname,
          filePath: filePath, // Store the full path on the server
          fileType: mimetype,
          fileSize: size,
        },
      });

      // TODO: Implement STL validation and 3D preview generation here
      // For STL validation, you might use a dedicated library or external process.
      // For 3D preview, you could generate a thumbnail image using sharp if it's a 2D image,
      // or integrate with a 3D rendering library to create a snapshot.

      res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (dbError: any) {
      // If database save fails, delete the uploaded file
      fs.unlinkSync(filePath);
      console.error('Database error saving file:', dbError);
      res.status(500).json({ error: 'Failed to save file metadata.' });
    }
  });
};

export const getFiles = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
  }

  try {
    const files = await prisma.file.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: id },
    });

    if (!file || file.userId !== userId) {
      return res.status(404).json({ error: 'File not found or unauthorized.' });
    }

    // Delete file from filesystem
    fs.unlinkSync(file.filePath);

    // Delete file from database
    await prisma.file.delete({
      where: { id: id },
    });

    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
};
