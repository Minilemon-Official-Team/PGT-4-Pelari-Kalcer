/**
 * Image Processor Library Test Suite
 *
 * Tests the image-processor library with various scenarios:
 * - Basic resize and watermark
 * - Different image sizes (small, medium, large)
 * - Skip watermark option
 * - Custom target height
 * - Compression quality comparison
 * - Various image formats
 *
 * Run: bun run scripts/test-image-processor.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import {
  COMPRESSION_QUALITY,
  DISPLAY_HEIGHT,
  getVersion,
  processImageForDisplay,
} from "../src/lib/image-processor";

const SAMPLES_DIR = path.resolve(process.cwd(), "public/samples");
const OUTPUT_DIR = path.resolve(process.cwd(), "temp/processed");

async function loadImage(filename: string): Promise<Buffer> {
  return fs.readFile(path.join(SAMPLES_DIR, filename));
}

async function saveImage(filename: string, buffer: Buffer): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

function printHeader(title: string) {
  console.info(`\n${"=".repeat(60)}`);
  console.info(`${title}`);
  console.info("=".repeat(60));
}

function printResult(label: string, value: string | number, expected?: string) {
  const exp = expected ? ` (expected: ${expected})` : "";
  console.info(`${label}: ${value}${exp}`);
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

function formatCompression(original: number, processed: number): string {
  const ratio = ((1 - processed / original) * 100).toFixed(1);
  return `${ratio}% smaller`;
}

async function main() {
  console.info("\nImage Processor Library Test Suite");
  console.info(`Sharp version: ${getVersion().sharp}`);
  console.info(`Default height: ${DISPLAY_HEIGHT}px`);
  console.info(`Default quality: ${COMPRESSION_QUALITY}%`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // -------------------------------------------------------------------------
  // Test 1: Basic Resize and Watermark
  // -------------------------------------------------------------------------
  printHeader("Test 1: Basic Resize and Watermark");

  const groupImage = await loadImage("group-1.jpg");
  const startTime = performance.now();
  const result = await processImageForDisplay(groupImage);
  const elapsed = (performance.now() - startTime).toFixed(0);

  printResult("Input size", formatBytes(groupImage.length));
  printResult("Output size", formatBytes(result.buffer.length));
  printResult("Original dimensions", formatDimensions(result.originalWidth, result.originalHeight));
  printResult(
    "Processed dimensions",
    formatDimensions(result.width, result.height),
    `≤ ${DISPLAY_HEIGHT}p`,
  );
  printResult("Compression", formatCompression(groupImage.length, result.buffer.length));
  printResult("Processing time", `${elapsed}ms`);

  const outputPath = await saveImage("test1-watermarked.jpg", result.buffer);
  console.info(`\nSaved: ${outputPath}`);

  // -------------------------------------------------------------------------
  // Test 2: Skip Watermark Option
  // -------------------------------------------------------------------------
  printHeader("Test 2: Skip Watermark Option");

  const noWatermark = await processImageForDisplay(groupImage, { skipWatermark: true });

  printResult("With watermark", formatBytes(result.buffer.length));
  printResult("Without watermark", formatBytes(noWatermark.buffer.length));
  printResult("Difference", `${result.buffer.length - noWatermark.buffer.length} bytes`);

  const noWmPath = await saveImage("test2-no-watermark.jpg", noWatermark.buffer);
  console.info(`\nSaved: ${noWmPath}`);

  // -------------------------------------------------------------------------
  // Test 3: Custom Target Height
  // -------------------------------------------------------------------------
  printHeader("Test 3: Custom Target Heights");

  const heights = [480, 720, 1080];

  for (const height of heights) {
    const processed = await processImageForDisplay(groupImage, { targetHeight: height });
    printResult(
      `${height}p`,
      `${formatDimensions(processed.width, processed.height)} → ${formatBytes(processed.buffer.length)}`,
    );

    await saveImage(`test3-${height}p.jpg`, processed.buffer);
  }

  console.info(`\nSaved: test3-480p.jpg, test3-720p.jpg, test3-1080p.jpg`);

  // -------------------------------------------------------------------------
  // Test 4: Quality Comparison
  // -------------------------------------------------------------------------
  printHeader("Test 4: Quality Comparison");

  const qualities = [60, 80, 95];

  for (const quality of qualities) {
    const processed = await processImageForDisplay(groupImage, { quality, skipWatermark: true });
    printResult(`Quality ${quality}%`, formatBytes(processed.buffer.length));

    await saveImage(`test4-quality-${quality}.jpg`, processed.buffer);
  }

  console.info(`\nSaved: test4-quality-60.jpg, test4-quality-80.jpg, test4-quality-95.jpg`);

  // -------------------------------------------------------------------------
  // Test 5: Various Sample Images
  // -------------------------------------------------------------------------
  printHeader("Test 5: Various Sample Images");

  const sampleFiles = ["person-vlado.jpg", "stock-emotions-a-1.jpg", "group-3.jpg"];

  for (const file of sampleFiles) {
    const buffer = await loadImage(file);
    const processed = await processImageForDisplay(buffer);

    const dims = `${formatDimensions(processed.originalWidth, processed.originalHeight)} → ${formatDimensions(processed.width, processed.height)}`;
    const compression = formatCompression(buffer.length, processed.buffer.length);

    console.info(`${file}:`);
    console.info(`  ${dims}, ${compression}`);

    await saveImage(`test5-${file}`, processed.buffer);
  }

  console.info(`\nSaved to: ${OUTPUT_DIR}/test5-*.jpg`);

  // -------------------------------------------------------------------------
  // Test 6: Small Image (No Upscaling)
  // -------------------------------------------------------------------------
  printHeader("Test 6: Small Image (No Upscaling)");

  // Create a small test case by using a portrait that might be smaller
  const stockImage = await loadImage("stock-emotions-a-1.jpg");
  const smallResult = await processImageForDisplay(stockImage, { targetHeight: 2000 });

  printResult("Original", formatDimensions(smallResult.originalWidth, smallResult.originalHeight));
  printResult("Processed", formatDimensions(smallResult.width, smallResult.height));

  const didUpscale = smallResult.height > smallResult.originalHeight;
  printResult("Upscaled?", didUpscale ? "❌ Yes (unexpected)" : "✅ No", "No upscaling");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  printHeader("Test Summary");

  console.info(`Output directory: ${OUTPUT_DIR}`);
  console.info(`Generated files:`);
  console.info(`  - test1-watermarked.jpg (basic watermark)`);
  console.info(`  - test2-no-watermark.jpg (skip watermark)`);
  console.info(`  - test3-*.jpg (different heights)`);
  console.info(`  - test4-quality-*.jpg (quality comparison)`);
  console.info(`  - test5-*.jpg (various samples)`);

  console.info("\n✅ Test suite completed! Inspect output files visually.\n");
}

main().catch(console.error);
