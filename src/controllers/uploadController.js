import path from 'path';

class UploadController {
  /**
   * POST /api/upload
   * Handle file upload
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const file = req.file;
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

      return res.status(200).json({
        success: true,
        url: fileUrl,
        name: file.originalname,
        size: file.size,
        mime_type: file.mimetype
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'File upload failed'
      });
    }
  }
}

export default new UploadController();
