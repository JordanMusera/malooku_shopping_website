import { requireAdmin } from '@/app/lib/admin-auth';
import dbConnect from '@/app/config/database';
import Product from '@/app/models/product';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { CloudinaryUploadError, deleteCloudinaryImages, readImageBuffers, uploadMultipleToCloudinary } from '../../authenticate/functions/cloudinary';

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
function parseJsonField<T>(data: FormData, key: string, fallback: T): T {
  const value = data.get(key);
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try { return JSON.parse(value) as T; } catch { throw new ProductInputError(`Invalid ${key}.`); }
}
class ProductInputError extends Error {}
function productFields(data: FormData) {
  const title = text(data, 'productName');
  const category = text(data, 'productCategory');
  const description = text(data, 'productDescription');
  const price = Number(data.get('productPrice'));
  const qty = Number(data.get('productQty'));
  if (!title || title.length > 160) throw new ProductInputError('Product name is required and must be under 160 characters.');
  if (!category || category.length > 100) throw new ProductInputError('Product category is required.');
  if (!description || description.length > 5000) throw new ProductInputError('Product description is required and must be under 5,000 characters.');
  if (!Number.isFinite(price) || price <= 0) throw new ProductInputError('Enter a valid product price.');
  if (!Number.isInteger(qty) || qty < 0) throw new ProductInputError('Enter a valid product quantity.');
  const specifications = parseJsonField(data, 'productSpecifications', []);
  const variants = parseJsonField(data, 'productVariants', {});
  if (!Array.isArray(specifications) || !variants || typeof variants !== 'object' || Array.isArray(variants)) throw new ProductInputError('Product specifications or variants are invalid.');
  return { title, category, description, price, qty, specifications, variants };
}
function statusFor(error: unknown) { return error instanceof CloudinaryUploadError ? error.status : error instanceof ProductInputError ? 400 : 503; }
function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Unable to complete the product request.'; }

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    return reply({ success: true, message: 'Products fetched successfully', content: products });
  } catch {
    return reply({ success: false, message: 'Unable to load products right now.' }, 503);
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request); if (denied) return denied;
  let uploaded: Awaited<ReturnType<typeof uploadMultipleToCloudinary>> = [];
  try {
    await dbConnect();
    const data = await request.formData();
    const fields = productFields(data);
    const buffers = await readImageBuffers(data);
    if (!buffers.length) return reply({ success: false, message: 'Add at least one product image.' }, 400);
    uploaded = await uploadMultipleToCloudinary(buffers, 'malooku/products');
    const product = await Product.create({ ...fields, images: uploaded.map((image) => ({ imageUrl: image.secure_url, publicId: image.public_id, assetId: image.asset_id })) });
    return reply({ success: true, message: 'Product saved successfully', content: product }, 201);
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.public_id));
    const status = statusFor(error);
    return reply({ success: false, message: errorMessage(error) }, status);
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request); if (denied) return denied;
  let uploaded: Awaited<ReturnType<typeof uploadMultipleToCloudinary>> = [];
  try {
    await dbConnect();
    const data = await request.formData();
    const productId = text(data, 'productId');
    if (!mongoose.isValidObjectId(productId)) return reply({ success: false, message: 'A valid product ID is required.' }, 400);
    const product = await Product.findById(productId);
    if (!product) return reply({ success: false, message: 'Product not found.' }, 404);
    const fields = productFields(data);
    const buffers = await readImageBuffers(data);
    let retainedImages = Array.isArray(product.images) ? product.images : [];
    if (!retainedImages.length && product.image) retainedImages = [{ imageUrl: product.image }];
    const retainedField = data.get('existingImageIds');
    if (typeof retainedField === 'string') {
      let retainedIds: unknown;
      try { retainedIds = JSON.parse(retainedField); } catch { return reply({ success: false, message: 'Existing image selection is invalid.' }, 400); }
      if (!Array.isArray(retainedIds) || retainedIds.some((id) => typeof id !== 'string')) return reply({ success: false, message: 'Existing image selection is invalid.' }, 400);
      const allowed = new Set(retainedIds);
      retainedImages = retainedImages.filter((image: any) => allowed.has(image.publicId || image.imageUrl));
    }
    if (!buffers.length && !retainedImages.length) return reply({ success: false, message: 'Keep or add at least one product image.' }, 400);
    uploaded = await uploadMultipleToCloudinary(buffers, 'malooku/products');
    const removedImageIds = (Array.isArray(product.images) ? product.images : []).filter((image: any) => image.publicId && !retainedImages.some((retained: any) => retained.publicId === image.publicId)).map((image: any) => image.publicId);
    product.set({ ...fields, images: [...retainedImages, ...uploaded.map((image) => ({ imageUrl: image.secure_url, publicId: image.public_id, assetId: image.asset_id }))] });
    await product.save();
    await deleteCloudinaryImages(removedImageIds);
    return reply({ success: true, message: 'Product updated successfully', content: product });
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.public_id));
    const status = statusFor(error);
    return reply({ success: false, message: errorMessage(error) }, status);
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const productId = new URL(request.url).searchParams.get('productId');
    if (!mongoose.isValidObjectId(productId)) return reply({ success: false, message: 'A valid product ID is required.' }, 400);
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return reply({ success: false, message: 'Product not found.' }, 404);
    await deleteCloudinaryImages((deleted.images || []).map((image: any) => image.publicId).filter(Boolean));
    return reply({ success: true, message: 'Product deleted successfully' });
  } catch {
    return reply({ success: false, message: 'Unable to delete the product right now.' }, 503);
  }
}
