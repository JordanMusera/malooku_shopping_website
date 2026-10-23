import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export const MAX_IMAGE_COUNT = 6;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/avif', 'image/gif', 'image/heic', 'image/heif', 'image/jpeg',
  'image/png', 'image/webp',
]);

export class CloudinaryUploadError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'CloudinaryUploadError';
    this.status = status;
  }
}

export type UploadedImage = Pick<UploadApiResponse, 'secure_url' | 'public_id' | 'asset_id'>;

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryUploadError('Image uploads are not configured. Set the Cloudinary environment variables.', 503);
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function readImageBuffers(formData: FormData, field = 'images'): Promise<Buffer[]> {
  const entries = formData.getAll(field).filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (entries.length > MAX_IMAGE_COUNT) {
    throw new CloudinaryUploadError(`Upload no more than ${MAX_IMAGE_COUNT} images at a time.`, 400);
  }
  let totalBytes = 0;
  const buffers: Buffer[] = [];
  for (const file of entries) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
      throw new CloudinaryUploadError(`“${file.name}” is not a supported image type.`, 400);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new CloudinaryUploadError(`Each image must be 4 MB or smaller.`, 400);
    }
    totalBytes += file.size;
    if (totalBytes > MAX_IMAGE_BYTES) {
      throw new CloudinaryUploadError('Images must total 4 MB or less per upload.', 400);
    }
    buffers.push(Buffer.from(await file.arrayBuffer()));
  }
  return buffers;
}

function uploadBuffer(fileBuffer: Buffer, folder?: string): Promise<UploadedImage> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder, unique_filename: true, use_filename: false, overwrite: false },
      (error, result) => {
        if (error || !result) return reject(new CloudinaryUploadError('Cloudinary could not upload the image. Please try again.', 502));
        resolve({ secure_url: result.secure_url, public_id: result.public_id, asset_id: result.asset_id });
      },
    ).end(fileBuffer);
  });
}

export const uploadToCloudinary = (fileBuffer: Buffer, folder?: string) => uploadBuffer(fileBuffer, folder);

export async function uploadMultipleToCloudinary(fileBuffers: Buffer[], folder?: string): Promise<UploadedImage[]> {
  if (fileBuffers.length === 0) return [];
  if (fileBuffers.length > MAX_IMAGE_COUNT || fileBuffers.some((buffer) => buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) || fileBuffers.reduce((sum, buffer) => sum + buffer.length, 0) > MAX_IMAGE_BYTES) {
    throw new CloudinaryUploadError('The selected images exceed the upload limits.', 400);
  }
  const results = await Promise.allSettled(fileBuffers.map((buffer) => uploadBuffer(buffer, folder)));
  const uploaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
  if (uploaded.length !== results.length) {
    await Promise.allSettled(uploaded.map((image) => cloudinary.uploader.destroy(image.public_id, { resource_type: 'image' })));
    throw new CloudinaryUploadError('Cloudinary could not upload the selected images. Please try again.', 502);
  }
  return uploaded;
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  const ids = publicIds.filter(Boolean);
  if (!ids.length) return;
  try {
    configureCloudinary();
    await Promise.allSettled(ids.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' })));
  } catch {
    // Cleanup is best-effort; the caller should still report the database result.
  }
}
