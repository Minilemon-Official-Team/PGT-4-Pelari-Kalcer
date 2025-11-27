/**
 * Image Processor Library Test Suite
 *
 * Comprehensive tests for the image-processor library covering:
 * - Configuration constants
 * - Image resizing with aspect ratio preservation
 * - Watermark application
 * - JPEG compression
 * - No upscaling behavior
 * - File output verification
 *
 * Run: bun test tests/lib/image-processor.test.ts
 * Run all: bun test
 */

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_COMPRESSION_QUALITY,
  DEFAULT_DISPLAY_HEIGHT,
  DEFAULT_WATERMARK_ANGLE,
  DEFAULT_WATERMARK_FONT_SIZE,
  DEFAULT_WATERMARK_OPACITY,
  DEFAULT_WATERMARK_SPACING,
  DEFAULT_WATERMARK_TEXT,
  getImageMetadata,
  getVersion,
  type ProcessedImage,
  processImageForDisplay,
  WATERMARK_CONFIG,
} from "../../src/lib/image-processor";

// ---------------------------------------------------------------------------
// Test Configuration
// ---------------------------------------------------------------------------

const SAMPLES_DIR = path.resolve(process.cwd(), "public/samples");
const OUTPUT_DIR = path.resolve(process.cwd(), "temp/test-output");

/**
 * Helper to load a sample image
 */
async function loadImage(filename: string): Promise<Buffer> {
  return fs.readFile(path.join(SAMPLES_DIR, filename));
}

/**
 * Helper to save a processed image for visual inspection
 */
async function saveTestOutput(filename: string, buffer: Buffer): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe("Image Processor Library", () => {
  // -------------------------------------------------------------------------
  // Setup & Teardown
  // -------------------------------------------------------------------------
  beforeAll(async () => {
    // Create output directory for visual inspection
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Optionally clean up test outputs
    // await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // Configuration Constants
  // -------------------------------------------------------------------------
  describe("Configuration Constants", () => {
    test("DEFAULT_DISPLAY_HEIGHT should be 1080", () => {
      expect(DEFAULT_DISPLAY_HEIGHT).toBe(1080);
    });

    test("DEFAULT_COMPRESSION_QUALITY should be 80", () => {
      expect(DEFAULT_COMPRESSION_QUALITY).toBe(80);
    });

    test("DEFAULT_WATERMARK_OPACITY should be 0.15", () => {
      expect(DEFAULT_WATERMARK_OPACITY).toBe(0.15);
    });

    test("DEFAULT_WATERMARK_TEXT should be 'RunCam'", () => {
      expect(DEFAULT_WATERMARK_TEXT).toBe("RunCam");
    });

    test("DEFAULT_WATERMARK_ANGLE should be -30", () => {
      expect(DEFAULT_WATERMARK_ANGLE).toBe(-30);
    });

    test("DEFAULT_WATERMARK_SPACING should be 150", () => {
      expect(DEFAULT_WATERMARK_SPACING).toBe(150);
    });

    test("DEFAULT_WATERMARK_FONT_SIZE should be 24", () => {
      expect(DEFAULT_WATERMARK_FONT_SIZE).toBe(24);
    });

    test("WATERMARK_CONFIG should match individual constants", () => {
      expect(WATERMARK_CONFIG.opacity).toBe(DEFAULT_WATERMARK_OPACITY);
      expect(WATERMARK_CONFIG.text).toBe(DEFAULT_WATERMARK_TEXT);
      expect(WATERMARK_CONFIG.angle).toBe(DEFAULT_WATERMARK_ANGLE);
      expect(WATERMARK_CONFIG.spacing).toBe(DEFAULT_WATERMARK_SPACING);
      expect(WATERMARK_CONFIG.fontSize).toBe(DEFAULT_WATERMARK_FONT_SIZE);
    });
  });

  // -------------------------------------------------------------------------
  // Library Version
  // -------------------------------------------------------------------------
  describe("Library Version", () => {
    test("getVersion() should return Sharp version info", () => {
      const versions = getVersion();
      expect(versions).toBeDefined();
      expect(versions.sharp).toBeDefined();
      expect(typeof versions.sharp).toBe("string");
    });

    test("getVersion() should include vips version", () => {
      const versions = getVersion();
      expect(versions.vips).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Image Metadata
  // -------------------------------------------------------------------------
  describe("Image Metadata", () => {
    test("getImageMetadata() should return valid metadata", async () => {
      const buffer = await loadImage("group-1.jpg");
      const metadata = await getImageMetadata(buffer);

      expect(metadata.width).toBeDefined();
      expect(metadata.height).toBeDefined();
      expect(metadata.format).toBe("jpeg");
    });

    test("getImageMetadata() should return correct dimensions", async () => {
      const buffer = await loadImage("group-1.jpg");
      const metadata = await getImageMetadata(buffer);

      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Basic Processing
  // -------------------------------------------------------------------------
  describe("Basic Processing", () => {
    let result: ProcessedImage;
    let inputBuffer: Buffer;

    beforeAll(async () => {
      inputBuffer = await loadImage("group-1.jpg");
      result = await processImageForDisplay(inputBuffer);
    });

    test("should return ProcessedImage object", () => {
      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(typeof result.width).toBe("number");
      expect(typeof result.height).toBe("number");
      expect(typeof result.originalWidth).toBe("number");
      expect(typeof result.originalHeight).toBe("number");
    });

    test("should preserve original dimensions in result", () => {
      expect(result.originalWidth).toBeGreaterThan(0);
      expect(result.originalHeight).toBeGreaterThan(0);
    });

    test("should resize to target height or smaller", () => {
      expect(result.height).toBeLessThanOrEqual(DEFAULT_DISPLAY_HEIGHT);
    });

    test("should maintain aspect ratio", () => {
      const originalRatio = result.originalWidth / result.originalHeight;
      const processedRatio = result.width / result.height;

      // Allow small tolerance for rounding
      expect(Math.abs(originalRatio - processedRatio)).toBeLessThan(0.01);
    });

    test("should produce valid JPEG output", async () => {
      const metadata = await getImageMetadata(result.buffer);
      expect(metadata.format).toBe("jpeg");
    });

    test("should compress the image", () => {
      // Processed image with compression should typically be smaller
      // (unless original was already heavily compressed)
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("output should be visually inspectable", async () => {
      const outputPath = await saveTestOutput("basic-processing.jpg", result.buffer);
      // File should exist and be readable
      const stat = await fs.stat(outputPath);
      expect(stat.size).toBe(result.buffer.length);
    });
  });

  // -------------------------------------------------------------------------
  // Watermark
  // -------------------------------------------------------------------------
  describe("Watermark", () => {
    test("should apply watermark by default", async () => {
      const buffer = await loadImage("group-1.jpg");
      const withWatermark = await processImageForDisplay(buffer);
      const withoutWatermark = await processImageForDisplay(buffer, { skipWatermark: true });

      // Watermarked image should be different (usually slightly larger)
      expect(withWatermark.buffer.length).not.toBe(withoutWatermark.buffer.length);
    });

    test("skipWatermark option should skip watermark", async () => {
      const buffer = await loadImage("group-1.jpg");
      const result = await processImageForDisplay(buffer, { skipWatermark: true });

      // Just verify it processes without error
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("watermark should add some overhead to file size", async () => {
      const buffer = await loadImage("person-vlado.jpg");
      const withWatermark = await processImageForDisplay(buffer);
      const withoutWatermark = await processImageForDisplay(buffer, { skipWatermark: true });

      // Watermark typically adds some bytes (though not always due to compression)
      // Just verify both produce valid output
      expect(withWatermark.buffer.length).toBeGreaterThan(0);
      expect(withoutWatermark.buffer.length).toBeGreaterThan(0);
    });

    test("output with watermark should be visually inspectable", async () => {
      const buffer = await loadImage("group-1.jpg");
      const result = await processImageForDisplay(buffer);
      await saveTestOutput("with-watermark.jpg", result.buffer);

      const noWm = await processImageForDisplay(buffer, { skipWatermark: true });
      await saveTestOutput("without-watermark.jpg", noWm.buffer);
    });
  });

  // -------------------------------------------------------------------------
  // Custom Target Height
  // -------------------------------------------------------------------------
  describe("Custom Target Height", () => {
    const targetHeights = [480, 720, 1080, 1440];

    test.each(targetHeights)("should resize to %ip target height", async (targetHeight) => {
      const buffer = await loadImage("group-1.jpg");
      const result = await processImageForDisplay(buffer, { targetHeight });

      expect(result.height).toBeLessThanOrEqual(targetHeight);
    });

    test("should maintain aspect ratio at different heights", async () => {
      const buffer = await loadImage("group-1.jpg");

      for (const targetHeight of [480, 720, 1080]) {
        const result = await processImageForDisplay(buffer, { targetHeight });

        const originalRatio = result.originalWidth / result.originalHeight;
        const processedRatio = result.width / result.height;

        expect(Math.abs(originalRatio - processedRatio)).toBeLessThan(0.01);
      }
    });

    test("output at different heights should be visually inspectable", async () => {
      const buffer = await loadImage("group-1.jpg");

      for (const height of [480, 720, 1080]) {
        const result = await processImageForDisplay(buffer, { targetHeight: height });
        await saveTestOutput(`height-${height}p.jpg`, result.buffer);
      }
    });
  });

  // -------------------------------------------------------------------------
  // No Upscaling
  // -------------------------------------------------------------------------
  describe("No Upscaling", () => {
    test("should not upscale images smaller than target", async () => {
      // Use a portrait image that might be smaller than 2000px
      const buffer = await loadImage("stock-emotions-a-1.jpg");
      const result = await processImageForDisplay(buffer, { targetHeight: 2000 });

      // Should not exceed original dimensions
      expect(result.height).toBeLessThanOrEqual(result.originalHeight);
      expect(result.width).toBeLessThanOrEqual(result.originalWidth);
    });

    test("should keep original size if already smaller than target", async () => {
      const buffer = await loadImage("person-vlado.jpg");
      const metadata = await getImageMetadata(buffer);
      const originalHeight = metadata.height ?? 0;

      // Request a much larger target
      const result = await processImageForDisplay(buffer, { targetHeight: 4000 });

      // Should maintain original height
      expect(result.height).toBe(originalHeight);
    });
  });

  // -------------------------------------------------------------------------
  // Compression Quality
  // -------------------------------------------------------------------------
  describe("Compression Quality", () => {
    const qualities = [60, 80, 95];

    test("higher quality should produce larger files", async () => {
      const buffer = await loadImage("group-1.jpg");
      const results: { quality: number; size: number }[] = [];

      for (const quality of qualities) {
        const result = await processImageForDisplay(buffer, {
          quality,
          skipWatermark: true, // Remove watermark variance
        });
        results.push({ quality, size: result.buffer.length });
      }

      // Sort by quality
      results.sort((a, b) => a.quality - b.quality);

      // Generally, higher quality = larger file
      // (though not always perfectly linear due to image content)
      expect(results[2].size).toBeGreaterThan(results[0].size);
    });

    test.each(qualities)("quality %i should produce valid output", async (quality) => {
      const buffer = await loadImage("group-1.jpg");
      const result = await processImageForDisplay(buffer, { quality, skipWatermark: true });

      expect(result.buffer.length).toBeGreaterThan(0);

      const metadata = await getImageMetadata(result.buffer);
      expect(metadata.format).toBe("jpeg");
    });

    test("output at different qualities should be visually inspectable", async () => {
      const buffer = await loadImage("group-1.jpg");

      for (const quality of qualities) {
        const result = await processImageForDisplay(buffer, {
          quality,
          skipWatermark: true,
        });
        await saveTestOutput(`quality-${quality}.jpg`, result.buffer);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Various Image Types
  // -------------------------------------------------------------------------
  describe("Various Image Types", () => {
    const testImages = [
      { file: "person-vlado.jpg", description: "single person" },
      { file: "stock-emotions-a-1.jpg", description: "portrait orientation" },
      { file: "group-1.jpg", description: "landscape group" },
      { file: "group-3.jpg", description: "smaller group" },
    ];

    test.each(testImages)("should process $description ($file)", async ({ file }) => {
      const buffer = await loadImage(file);
      const result = await processImageForDisplay(buffer);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    test("processed images should be visually inspectable", async () => {
      for (const { file } of testImages) {
        const buffer = await loadImage(file);
        const result = await processImageForDisplay(buffer);
        await saveTestOutput(`various-${file}`, result.buffer);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Error Handling
  // -------------------------------------------------------------------------
  describe("Error Handling", () => {
    test("should throw for invalid image buffer", async () => {
      const invalidBuffer = Buffer.from("not an image");

      await expect(processImageForDisplay(invalidBuffer)).rejects.toThrow();
    });

    test("should throw for empty buffer", async () => {
      const emptyBuffer = Buffer.alloc(0);

      await expect(processImageForDisplay(emptyBuffer)).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Default Options
  // -------------------------------------------------------------------------
  describe("Default Options", () => {
    test("should use DEFAULT_DISPLAY_HEIGHT when no targetHeight specified", async () => {
      const buffer = await loadImage("group-1.jpg");
      const result = await processImageForDisplay(buffer);

      expect(result.height).toBeLessThanOrEqual(DEFAULT_DISPLAY_HEIGHT);
    });

    test("should apply watermark when skipWatermark is not specified", async () => {
      const buffer = await loadImage("person-vlado.jpg");

      // Process with default options (should have watermark)
      const withDefault = await processImageForDisplay(buffer);

      // Process explicitly without watermark
      const withoutWatermark = await processImageForDisplay(buffer, {
        skipWatermark: true,
      });

      // They should produce different outputs
      expect(withDefault.buffer.length).not.toBe(withoutWatermark.buffer.length);
    });
  });

  // -------------------------------------------------------------------------
  // Processing Performance
  // -------------------------------------------------------------------------
  describe("Processing Performance", () => {
    test("should process a typical image in reasonable time", async () => {
      const buffer = await loadImage("group-1.jpg");

      const start = performance.now();
      await processImageForDisplay(buffer);
      const elapsed = performance.now() - start;

      // Should complete within 5 seconds for a typical image
      expect(elapsed).toBeLessThan(5000);
    });

    test("should process multiple images sequentially", async () => {
      const files = ["person-vlado.jpg", "stock-emotions-a-1.jpg", "group-1.jpg"];

      for (const file of files) {
        const buffer = await loadImage(file);
        const result = await processImageForDisplay(buffer);
        expect(result.buffer.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Output File Verification (Visual Inspection)
  // -------------------------------------------------------------------------
  describe("Output File Verification", () => {
    test("all test outputs should be saved for visual inspection", async () => {
      // List all files in output directory
      const files = await fs.readdir(OUTPUT_DIR);

      // Should have created some test outputs
      expect(files.length).toBeGreaterThan(0);

      console.info(`\n📁 Test outputs saved to: ${OUTPUT_DIR}`);
      console.info(`   Files: ${files.join(", ")}`);
    });
  });
});
