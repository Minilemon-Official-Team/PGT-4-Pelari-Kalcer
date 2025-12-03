/**
 * Image Processing Module
 *
 * Handles image resizing, watermarking, and compression
 * for the photo processing pipeline.
 *
 * @module image-processor
 */

import sharp from "sharp";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Default target height for display images in pixels */
export const DEFAULT_DISPLAY_HEIGHT = 1080;

/** Default JPEG compression quality */
export const DEFAULT_COMPRESSION_QUALITY = 80;

/** Default watermark opacity */
export const DEFAULT_WATERMARK_OPACITY = 0.15;

/** Default watermark text */
export const DEFAULT_WATERMARK_TEXT = "RunCam";

/** Default watermark rotation angle in degrees */
export const DEFAULT_WATERMARK_ANGLE = -30;

/** Default spacing between watermark repetitions in pixels */
export const DEFAULT_WATERMARK_SPACING = 150;

/** Default watermark font size in pixels */
export const DEFAULT_WATERMARK_FONT_SIZE = 24;

/** Watermark configuration object */
export const WATERMARK_CONFIG = {
  opacity: DEFAULT_WATERMARK_OPACITY,
  text: DEFAULT_WATERMARK_TEXT,
  angle: DEFAULT_WATERMARK_ANGLE,
  spacing: DEFAULT_WATERMARK_SPACING,
  fontSize: DEFAULT_WATERMARK_FONT_SIZE,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result from image processing operations */
export interface ProcessedImage {
  /** Processed image buffer (JPEG format) */
  buffer: Buffer;
  /** Width of processed image in pixels */
  width: number;
  /** Height of processed image in pixels */
  height: number;
  /** Original width before processing in pixels */
  originalWidth: number;
  /** Original height before processing in pixels */
  originalHeight: number;
}

/** Options for image processing */
export interface ProcessingOptions {
  /** Target height in pixels (no upscaling) */
  targetHeight?: number;
  /** JPEG compression quality (0-100) */
  quality?: number;
  /** Skip watermark overlay */
  skipWatermark?: boolean;
}

// ---------------------------------------------------------------------------
// Watermark Generation
// ---------------------------------------------------------------------------

/** Generate SVG watermark pattern for the given dimensions. */
function generateWatermarkSvg(width: number, height: number): Buffer {
  const { text, angle, spacing, opacity, fontSize } = WATERMARK_CONFIG;

  // Calculate how many repetitions we need
  const diagonal = Math.sqrt(width * width + height * height);
  const cols = Math.ceil(diagonal / spacing) + 2;
  const rows = Math.ceil(diagonal / spacing) + 2;

  // Generate text elements
  let textElements = "";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - diagonal / 2;
      const y = row * spacing - diagonal / 2;
      textElements += `<text x="${x}" y="${y}" fill="white" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold">${text}</text>`;
    }
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          text { opacity: ${opacity}; }
        </style>
      </defs>
      <g transform="translate(${width / 2}, ${height / 2}) rotate(${angle})">
        ${textElements}
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

// ---------------------------------------------------------------------------
// Core Processing Functions
// ---------------------------------------------------------------------------

/**
 * Process an image for display:
 * 1. Resize to target height (maintains aspect ratio)
 * 2. Apply diagonal watermark pattern
 * 3. Compress as JPEG
 */
export async function processImageForDisplay(
  inputBuffer: Buffer,
  options: ProcessingOptions = {},
): Promise<ProcessedImage> {
  const {
    targetHeight = DEFAULT_DISPLAY_HEIGHT,
    quality = DEFAULT_COMPRESSION_QUALITY,
    skipWatermark = false,
  } = options;

  // Get original metadata
  const metadata = await sharp(inputBuffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  if (!originalWidth || !originalHeight) {
    throw new Error("Could not read image dimensions");
  }

  // Calculate new dimensions (maintain aspect ratio)
  const aspectRatio = originalWidth / originalHeight;
  const newHeight = Math.min(targetHeight, originalHeight); // Don't upscale
  const newWidth = Math.round(newHeight * aspectRatio);

  // Resize
  let pipeline = sharp(inputBuffer).resize({
    width: newWidth,
    height: newHeight,
    fit: "inside",
    withoutEnlargement: true,
  });

  // Watermark
  if (!skipWatermark) {
    const watermarkSvg = generateWatermarkSvg(newWidth, newHeight);
    pipeline = pipeline.composite([
      {
        input: watermarkSvg,
        blend: "over",
      },
    ]);
  }

  // Compress as JPEG
  const buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

  // Get final metadata
  const finalMetadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: finalMetadata.width ?? newWidth,
    height: finalMetadata.height ?? newHeight,
    originalWidth,
    originalHeight,
  };
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/** Get image metadata without processing. */
export async function getImageMetadata(buffer: Buffer) {
  return sharp(buffer).metadata();
}

/** Get the Sharp library versions. */
export function getVersion() {
  return sharp.versions;
}
