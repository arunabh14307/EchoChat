# Media Attachments Storage

This directory is designated for **storing local media uploads, file attachments, and cache archives**.

### 📁 Media Pipeline Summary:
* Currently, EchoChat uploads all media attachments (images, videos, documents, PDFs) directly to **Cloudinary** for global scale and high performance.
* You can configure local disk uploads inside `backend/src/middleware/upload.middleware.js` to write directly to this folder if you choose to bypass Cloudinary.
* Standard size limits: up to **25MB** per file.
