import { createBucketClient } from '@cosmicjs/sdk';

// Initialize the Cosmic SDK
export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || 'image-shelf-production',
  readKey: process.env.COSMIC_READ_KEY || '',
  writeKey: process.env.COSMIC_WRITE_KEY || '',
});

// Helper to check for Cosmic errors
export function isCosmicError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}