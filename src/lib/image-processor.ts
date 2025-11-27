/**
 * Image Processing Module
 *
 * Handles image resizing, watermarking, and compression
 * for the photo processing pipeline.
 *
 * @module image-processor
 * @see {@link processImageForDisplay} - Main processing function
 *
 * @example
 * ```ts
 * import { processImageForDisplay } from "@/lib/image-processor";
 *
 * const raw = await fs.readFile("photo.jpg");
 * const result = await processImageForDisplay(raw);
 * await fs.writeFile("display.jpg", result.buffer);
 * ```
 */

import sharp from "sharp";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Default target height for display images in pixels.
 * Maintains aspect ratio; images smaller than this won't be upscaled.
 * @default 1080
 */
export const DEFAULT_DISPLAY_HEIGHT = 1080;

/**
 * Default JPEG compression quality.
 * Higher values = better quality but larger files.
 * @default 80
 */
export const DEFAULT_COMPRESSION_QUALITY = 80;

/**
 * Default watermark opacity.
 * Higher values = more visible watermark.
 * @default 0.15
 */
export const DEFAULT_WATERMARK_OPACITY = 0.15;

/**
 * Default watermark text.
 * @default "RunCam"
 */
export const DEFAULT_WATERMARK_TEXT = "RunCam";

/**
 * Default watermark rotation angle in degrees.
 * Negative = counter-clockwise.
 * @default -30
 */
export const DEFAULT_WATERMARK_ANGLE = -30;

/**
 * Default spacing between watermark repetitions in pixels.
 * @default 150
 */
export const DEFAULT_WATERMARK_SPACING = 150;

/**
 * Default watermark font size in pixels.
 * @default 24
 */
export const DEFAULT_WATERMARK_FONT_SIZE = 24;

/**
 * Watermark configuration object.
 * Individual values can be imported separately as DEFAULT_WATERMARK_* constants.
 */
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

/**
 * Result from image processing operations.
 *
 * @see {@link processImageForDisplay}
 */
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

/**
 * Options for image processing.
 *
 * All options have sensible defaults and can be imported as constants:
 * - `targetHeight` defaults to {@link DEFAULT_DISPLAY_HEIGHT}
 * - `quality` defaults to {@link DEFAULT_COMPRESSION_QUALITY}
 *
 * @see {@link processImageForDisplay}
 */
export interface ProcessingOptions {
  /**
   * Target height in pixels.
   * Images smaller than this will not be upscaled.
   * @default 1080 (DEFAULT_DISPLAY_HEIGHT)
   */
  targetHeight?: number;
  /**
   * JPEG compression quality (0-100).
   * Higher values = better quality but larger files.
   * @default 80 (DEFAULT_COMPRESSION_QUALITY)
   */
  quality?: number;
  /**
   * Skip watermark overlay.
   * Useful for testing or admin previews.
   * @default false
   */
  skipWatermark?: boolean;
}

// ---------------------------------------------------------------------------
// Watermark Generation
// ---------------------------------------------------------------------------

/**
 * Generate SVG watermark pattern for the given dimensions.
 * Creates diagonal repeating text pattern.
 *
 * @internal
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns SVG buffer for compositing
 */
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
 *
 * @param inputBuffer - Raw image buffer (JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG)
 * @param options - Processing options (all optional with sensible defaults)
 * @returns Processed image with metadata
 *
 * @throws {Error} If image dimensions cannot be read (corrupted or unsupported format)
 *
 * @since 0.1.0
 * @see {@link ProcessingOptions} for available options
 * @see {@link ProcessedImage} for return type details
 *
 * @example Basic usage
 * ```ts
 * const raw = await fs.readFile("photo.jpg");
 * const result = await processImageForDisplay(raw);
 * await fs.writeFile("photo-display.jpg", result.buffer);
 * ```
 *
 * @example With custom options
 * ```ts
 * const result = await processImageForDisplay(raw, {
 *   targetHeight: 720,
 *   quality: 90,
 *   skipWatermark: true,
 * });
 * ```
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

/**
 * Get image metadata without processing.
 *
 * @param buffer - Raw image buffer
 * @returns Sharp metadata (width, height, format, etc.)
 *
 * @since 0.1.0
 * @see https://sharp.pixelplumbing.com/api-input#metadata
 *
 * @example
 * ```ts
 * const meta = await getImageMetadata(buffer);
 * console.log(`${meta.width}x${meta.height} ${meta.format}`);
 * ```
 */
export async function getImageMetadata(buffer: Buffer) {
  return sharp(buffer).metadata();
}

/**
 * Get the Sharp library versions.
 *
 * Useful for debugging and ensuring the correct native bindings are installed.
 *
 * @returns Object with version strings for Sharp, libvips, and other dependencies
 *
 * @since 0.1.0
 * @see https://sharp.pixelplumbing.com/api-utility#versions
 *
 * @example
 * ```ts
 * const versions = getVersion();
 * console.log(`Sharp: ${versions.sharp}, libvips: ${versions.vips}`);
 * ```
 */
export function getVersion() {
  return sharp.versions;
}
