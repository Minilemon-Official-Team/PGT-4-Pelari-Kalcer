/**
 * Face AI Library Test Script
 *
 * Tests the face-ai library with various scenarios:
 * - Same person matching across photos
 * - Different people non-matching
 * - Self-similarity verification
 * - No face detection (background images)
 * - Multi-face detection in group photos
 * - Selfie validation (antispoof + liveness)
 * - Finding a person in group photos (core use case)
 *
 * Run with: bun run scripts/test-face-ai.ts
 */

import fs from "node:fs";
import path from "node:path";
import {
  compareFaces,
  getMemoryStats,
  getVersion,
  initHuman,
  processPhotoForEmbeddings,
  validateSelfie,
} from "../src/lib/face-ai";

const SAMPLES_DIR = path.resolve(process.cwd(), "public/samples");

function loadImage(filename: string): Buffer {
  return fs.readFileSync(path.join(SAMPLES_DIR, filename));
}

function printHeader(title: string) {
  console.info(`\n${"=".repeat(60)}`);
  console.info(`  ${title}`);
  console.info("=".repeat(60));
}

function printResult(label: string, value: string | number, expected?: string) {
  const exp = expected ? ` (expected: ${expected})` : "";
  console.info(`  ${label}: ${value}${exp}`);
}

async function main() {
  await initHuman();

  console.info("\n  Face AI Library Test Suite");
  console.info(`  Human version: ${getVersion()}`);

  // -------------------------------------------------------------------------
  // Test 1: Same Person - Different Photos (Vlado)
  // -------------------------------------------------------------------------
  printHeader("Test 1: Same Person - Different Photos");

  const vladoResult1 = await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
  const vladoResult2 = await processPhotoForEmbeddings(loadImage("person-vlado1.jpg"));

  if (vladoResult1.faces.length >= 1 && vladoResult2.faces.length >= 1) {
    const similarity = compareFaces(
      vladoResult1.faces[0].embedding,
      vladoResult2.faces[0].embedding,
    );
    printResult("Vlado vs Vlado (different photos)", similarity.toFixed(4), ">= 0.40");
  } else {
    console.info("  ❌ Could not detect faces in Vlado photos");
  }

  // -------------------------------------------------------------------------
  // Test 2: Same Person - Stock Emotions (Clear Faces)
  // -------------------------------------------------------------------------
  printHeader("Test 2: Same Person - Stock Emotions (Clear Faces)");

  const stockA1 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-1.jpg"));
  const stockA3 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-3.jpg"));

  if (stockA1.faces.length >= 1 && stockA3.faces.length >= 1) {
    const similarity = compareFaces(stockA1.faces[0].embedding, stockA3.faces[0].embedding);
    printResult("Stock A-1 vs A-3 (uncovered faces)", similarity.toFixed(4), ">= 0.50");
  }

  // -------------------------------------------------------------------------
  // Test 3: Different People
  // -------------------------------------------------------------------------
  printHeader("Test 3: Different People");

  const stockB3 = await processPhotoForEmbeddings(loadImage("stock-emotions-b-3.jpg"));

  if (stockA3.faces.length >= 1 && stockB3.faces.length >= 1) {
    const similarity = compareFaces(stockA3.faces[0].embedding, stockB3.faces[0].embedding);
    printResult("Stock A vs Stock B", similarity.toFixed(4), "< 0.35");
  }

  // -------------------------------------------------------------------------
  // Test 4: Self-Similarity (Same Image)
  // -------------------------------------------------------------------------
  printHeader("Test 4: Self-Similarity");

  if (stockA3.faces.length >= 1) {
    const similarity = compareFaces(stockA3.faces[0].embedding, stockA3.faces[0].embedding);
    printResult("Same image comparison", similarity.toFixed(4), "1.0000");
  }

  // -------------------------------------------------------------------------
  // Test 5: No Face Detection
  // -------------------------------------------------------------------------
  printHeader("Test 5: No Face Detection");

  const backgroundResult = await processPhotoForEmbeddings(loadImage("background.jpg"));
  printResult("Background image faces", backgroundResult.facesCount, "0");

  // -------------------------------------------------------------------------
  // Test 6: Group Photo - Multi-Face Detection
  // -------------------------------------------------------------------------
  printHeader("Test 6: Group Photo - Multi-Face Detection");

  const group3 = await processPhotoForEmbeddings(loadImage("group-3.jpg"));
  printResult("group-3.jpg faces", group3.facesCount, "4");

  const group1 = await processPhotoForEmbeddings(loadImage("group-1.jpg"));
  printResult("group-1.jpg faces", group1.facesCount, ">= 5");

  // -------------------------------------------------------------------------
  // Test 7: Selfie Validation
  // -------------------------------------------------------------------------
  printHeader("Test 7: Selfie Validation");

  // Good selfie - clear, single face
  const selfieResult = await validateSelfie(loadImage("stock-emotions-a-3.jpg"));
  console.info("  Good selfie (stock-emotions-a-3.jpg):");
  printResult("    Valid", selfieResult.isValid ? "✅ Yes" : `❌ No - ${selfieResult.error}`);
  if (selfieResult.isValid) {
    printResult("    Real score", selfieResult.realScore?.toFixed(4) ?? "N/A", ">= 0.50");
    printResult("    Live score", selfieResult.liveScore?.toFixed(4) ?? "N/A", ">= 0.50");
    printResult("    Embedding length", selfieResult.embedding?.length ?? 0, "1024");
  }

  // Multiple faces - should reject
  const multiResult = await validateSelfie(loadImage("group-3.jpg"));
  console.info("\n  Multiple faces (group-3.jpg):");
  printResult("    Valid", multiResult.isValid ? "❌ Should reject" : "✅ Rejected");
  if (!multiResult.isValid) {
    printResult("    Error", multiResult.error ?? "N/A");
  }

  // No face - should reject
  const noFaceResult = await validateSelfie(loadImage("background.jpg"));
  console.info("\n  No face (background.jpg):");
  printResult("    Valid", noFaceResult.isValid ? "❌ Should reject" : "✅ Rejected");
  if (!noFaceResult.isValid) {
    printResult("    Error", noFaceResult.error ?? "N/A");
  }

  // -------------------------------------------------------------------------
  // Test 8: Find Person in Group Photo
  // -------------------------------------------------------------------------
  printHeader("Test 8: Find Person in Group Photo");

  // Vlado's selfie embedding
  const vladoSelfie = vladoResult1.faces[0]?.embedding;

  if (vladoSelfie && group1.faces.length > 0) {
    console.info("  Searching for Vlado in group-1.jpg...");
    console.info(`  Group has ${group1.facesCount} faces\n`);

    const matches: { index: number; similarity: number }[] = [];

    for (const face of group1.faces) {
      const similarity = compareFaces(vladoSelfie, face.embedding);
      matches.push({ index: face.index, similarity });
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    // Show top 3 matches
    console.info("  Top matches:");
    for (let i = 0; i < Math.min(3, matches.length); i++) {
      const m = matches[i];
      const isMatch = m.similarity >= 0.4 ? "✅ MATCH" : "";
      console.info(`    Face #${m.index}: ${m.similarity.toFixed(4)} ${isMatch}`);
    }

    const bestMatch = matches[0];
    if (bestMatch.similarity >= 0.4) {
      console.info(`\n  ✅ Vlado found in group photo (Face #${bestMatch.index})`);
    } else {
      console.info("\n  ❌ Vlado not confidently found in group photo");
    }
  }

  // -------------------------------------------------------------------------
  // Test 9: Cross-Group Matching (Vlado across multiple groups)
  // -------------------------------------------------------------------------
  printHeader("Test 9: Cross-Group Matching");

  if (vladoSelfie) {
    const groupFiles = [
      "group-1.jpg",
      "group-2.jpg",
      "group-3.jpg", // Expected to fail
      "group-4.jpg",
      "group-5.jpg",
      "stock-group-1.jpg", // Expected to fail
    ];
    console.info("  Searching for Vlado across group photos...\n");

    for (const file of groupFiles) {
      const groupResult = await processPhotoForEmbeddings(loadImage(file));
      let bestSim = 0;

      for (const face of groupResult.faces) {
        const sim = compareFaces(vladoSelfie, face.embedding);
        if (sim > bestSim) {
          bestSim = sim;
        }
      }

      const status = bestSim >= 0.4 ? "✅" : "❌";
      console.info(
        `  ${file}: ${groupResult.facesCount} faces, best match: ${bestSim.toFixed(4)} ${status}`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Memory Stats
  // -------------------------------------------------------------------------
  printHeader("Memory Stats");
  const mem = getMemoryStats();
  console.info(`  Tensors: ${mem.numTensors}`);
  console.info(`  Bytes: ${(mem.numBytes / 1024 / 1024).toFixed(2)} MB`);

  console.info("\n✅ Test suite completed!\n");
}

main().catch(console.error);
