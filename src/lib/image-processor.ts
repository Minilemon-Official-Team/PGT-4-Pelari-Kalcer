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

/** Target height for display images (maintains aspect ratio) */
export const DISPLAY_HEIGHT = 1080;

/** JPEG compression quality (0-100) */
export const COMPRESSION_QUALITY = 80;

/** Watermark configuration */
export const WATERMARK_CONFIG = {
  /** Opacity of watermark overlay (0-1) */
  opacity: 0.15,
  /** Text to display */
  text: "RunCam",
  /** Angle of diagonal lines in degrees */
  angle: -30,
  /** Spacing between watermark repetitions */
  spacing: 150,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProcessedImage {
  /** Processed image buffer (JPEG) */
  buffer: Buffer;
  /** Width of processed image */
  width: number;
  /** Height of processed image */
  height: number;
  /** Original width before processing */
  originalWidth: number;
  /** Original height before processing */
  originalHeight: number;
}

export interface ProcessingOptions {
  /** Target height in pixels. Default: 1080 */
  targetHeight?: number;
  /** JPEG quality 0-100. Default: 80 */
  quality?: number;
  /** Skip watermarking. Default: false */
  skipWatermark?: boolean;
}

// ---------------------------------------------------------------------------
// Watermark Generation
// ---------------------------------------------------------------------------

/**
 * Generate SVG watermark pattern for the given dimensions.
 * Creates diagonal repeating text pattern.
 */
function generateWatermarkSvg(width: number, height: number): Buffer {
  const { text, angle, spacing, opacity } = WATERMARK_CONFIG;

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
      textElements += `<text x="${x}" y="${y}" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">${text}</text>`;
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
 *
 * @param inputBuffer - Raw image buffer (JPEG, PNG, etc.)
 * @param options - Processing options
 * @returns Processed image with metadata
 *
 * @example
 * ```ts
 * const raw = await fs.readFile("photo.jpg");
 * const result = await processImageForDisplay(raw);
 * await fs.writeFile("photo-display.jpg", result.buffer);
 * console.log(`Resized from ${result.originalHeight}p to ${result.height}p`);
 * ```
 */
export async function processImageForDisplay(
  inputBuffer: Buffer,
  options: ProcessingOptions = {},
): Promise<ProcessedImage> {
  const {
    targetHeight = DISPLAY_HEIGHT,
    quality = COMPRESSION_QUALITY,
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

/**
 * Get image metadata without processing.
 */
export async function getImageMetadata(buffer: Buffer) {
  return sharp(buffer).metadata();
}

/**
 * Get the Sharp library versions.
 */
export function getVersion() {
  return sharp.versions;
}
