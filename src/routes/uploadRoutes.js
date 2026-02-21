import express from 'express';
import upload from '../config/upload.js';
import uploadController from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload - Upload a file
router.post('/', upload.single('file'), uploadController.uploadFile.bind(uploadController));

export default router;
