import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { ApiError } from '../../errors';

export const uploadsDirectory = resolve(process.cwd(), 'uploads');
mkdirSync(uploadsDirectory, { recursive: true });
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateReceipt(mimeType: string, size: number): void {
  if (!allowedMimeTypes.has(mimeType)) throw new ApiError(400, 'INVALID_RECEIPT', 'Receipt must be a JPEG, PNG, or WebP image.');
  if (size > 5 * 1024 * 1024) throw new ApiError(400, 'RECEIPT_TOO_LARGE', 'Receipt image must be 5 MB or smaller.');
}

export const receiptUpload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (_req, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
});
