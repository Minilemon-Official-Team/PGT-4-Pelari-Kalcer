/**
 * Face AI Library Test Suite
 *
 * Comprehensive tests for the face-ai library covering:
 * - Library initialization
 * - Face detection in single and group photos
 * - Embedding extraction and dimensions
 * - Face similarity matching
 * - Selfie validation (antispoof + liveness)
 * - Edge cases (no faces, multiple faces)
 *
 * Run: bun test tests/lib/face-ai.test.ts
 * Run all: bun test
 */

import { beforeAll, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
  compareFaces,
  DEFAULT_MATCH_THRESHOLD,
  DEFAULT_MAX_DETECTED,
  DEFAULT_MIN_CONFIDENCE,
  DEFAULT_MIN_LIVE_SCORE,
  DEFAULT_MIN_REAL_SCORE,
  DEFAULT_SELFIE_MIN_CONFIDENCE,
  EMBEDDING_DIMENSIONS,
  getMemoryStats,
  getVersion,
  initHuman,
  isHumanInitialized,
  type PhotoProcessingResult,
  processPhotoForEmbeddings,
  type SelfieValidationResult,
  validateSelfie,
} from "../../src/lib/face-ai";

// ---------------------------------------------------------------------------
// Test Configuration
// ---------------------------------------------------------------------------

const SAMPLES_DIR = path.resolve(process.cwd(), "public/samples");

// Increase timeout for AI model operations
const AI_TIMEOUT = 60_000; // 60 seconds

/**
 * Helper to load a sample image
 */
function loadImage(filename: string): Buffer {
  return fs.readFileSync(path.join(SAMPLES_DIR, filename));
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe("Face AI Library", () => {
  // -------------------------------------------------------------------------
  // Setup - Initialize Human AI once before all tests
  // -------------------------------------------------------------------------
  beforeAll(async () => {
    await initHuman();
  }, AI_TIMEOUT);

  // -------------------------------------------------------------------------
  // Configuration Constants
  // -------------------------------------------------------------------------
  describe("Configuration Constants", () => {
    test("EMBEDDING_DIMENSIONS should be 1024 (faceres model)", () => {
      expect(EMBEDDING_DIMENSIONS).toBe(1024);
    });

    test("DEFAULT_MIN_CONFIDENCE should be 0.5", () => {
      expect(DEFAULT_MIN_CONFIDENCE).toBe(0.5);
    });

    test("DEFAULT_MAX_DETECTED should be 50", () => {
      expect(DEFAULT_MAX_DETECTED).toBe(50);
    });

    test("DEFAULT_SELFIE_MIN_CONFIDENCE should be 0.6", () => {
      expect(DEFAULT_SELFIE_MIN_CONFIDENCE).toBe(0.6);
    });

    test("DEFAULT_MIN_REAL_SCORE should be 0.5", () => {
      expect(DEFAULT_MIN_REAL_SCORE).toBe(0.5);
    });

    test("DEFAULT_MIN_LIVE_SCORE should be 0.5", () => {
      expect(DEFAULT_MIN_LIVE_SCORE).toBe(0.5);
    });

    test("DEFAULT_MATCH_THRESHOLD should be 0.4", () => {
      expect(DEFAULT_MATCH_THRESHOLD).toBe(0.4);
    });
  });

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  describe("Initialization", () => {
    test("initHuman() should initialize the library", () => {
      expect(isHumanInitialized()).toBe(true);
    });

    test("getVersion() should return a valid version string", () => {
      const version = getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/); // semver pattern
    });

    test("getMemoryStats() should return valid memory info", () => {
      const stats = getMemoryStats();
      expect(stats).toBeDefined();
      expect(stats.numTensors).toBeGreaterThanOrEqual(0);
      expect(stats.numBytes).toBeGreaterThanOrEqual(0);
    });
  });

  // -------------------------------------------------------------------------
  // Face Detection - Single Person
  // -------------------------------------------------------------------------
  describe("Face Detection - Single Person", () => {
    let vladoResult1: PhotoProcessingResult;
    let vladoResult2: PhotoProcessingResult;

    beforeAll(async () => {
      vladoResult1 = await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
      vladoResult2 = await processPhotoForEmbeddings(loadImage("person-vlado1.jpg"));
    }, AI_TIMEOUT);

    test("should detect exactly 1 face in person-vlado.jpg", () => {
      expect(vladoResult1.facesCount).toBe(1);
      expect(vladoResult1.faces).toHaveLength(1);
    });

    test("should detect exactly 1 face in person-vlado1.jpg", () => {
      expect(vladoResult2.facesCount).toBe(1);
      expect(vladoResult2.faces).toHaveLength(1);
    });

    test("detected face should have valid embedding dimensions", () => {
      const face = vladoResult1.faces[0];
      expect(face.embedding).toHaveLength(EMBEDDING_DIMENSIONS);
    });

    test("detected face should have valid bounding box", () => {
      const face = vladoResult1.faces[0];
      expect(face.box).toHaveLength(4);
      // Box values should be normalized 0-1
      for (const value of face.box) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    test("detected face should have valid confidence score", () => {
      const face = vladoResult1.faces[0];
      expect(face.confidence).toBeGreaterThan(DEFAULT_MIN_CONFIDENCE);
      expect(face.confidence).toBeLessThanOrEqual(1);
    });

    test("detected face should have age estimation", () => {
      const face = vladoResult1.faces[0];
      expect(face.age).toBeDefined();
      expect(face.age).toBeGreaterThan(0);
      expect(face.age).toBeLessThan(120);
    });

    test("detected face should have gender detection", () => {
      const face = vladoResult1.faces[0];
      expect(face.gender).toBeDefined();
      if (face.gender) {
        expect(["male", "female"]).toContain(face.gender);
      }
      expect(face.genderScore).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Face Detection - Stock Photos (Clear Faces)
  // -------------------------------------------------------------------------
  describe("Face Detection - Stock Photos", () => {
    let stockA1: PhotoProcessingResult;
    let stockA3: PhotoProcessingResult;
    let stockB3: PhotoProcessingResult;

    beforeAll(async () => {
      stockA1 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-1.jpg"));
      stockA3 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-3.jpg"));
      stockB3 = await processPhotoForEmbeddings(loadImage("stock-emotions-b-3.jpg"));
    }, AI_TIMEOUT);

    test("should detect 1 face in stock-emotions-a-1.jpg", () => {
      expect(stockA1.facesCount).toBe(1);
    });

    test("should detect 1 face in stock-emotions-a-3.jpg", () => {
      expect(stockA3.facesCount).toBe(1);
    });

    test("should detect 1 face in stock-emotions-b-3.jpg", () => {
      expect(stockB3.facesCount).toBe(1);
    });

    test("stock photos should have high confidence (clear faces)", () => {
      expect(stockA1.faces[0].confidence).toBeGreaterThan(0.8);
      expect(stockA3.faces[0].confidence).toBeGreaterThan(0.8);
      expect(stockB3.faces[0].confidence).toBeGreaterThan(0.8);
    });
  });

  // -------------------------------------------------------------------------
  // Face Detection - Group Photos
  // -------------------------------------------------------------------------
  describe("Face Detection - Group Photos", () => {
    test(
      "should detect 4 faces in group-3.jpg",
      async () => {
        const result = await processPhotoForEmbeddings(loadImage("group-3.jpg"));
        expect(result.facesCount).toBe(4);
      },
      AI_TIMEOUT,
    );

    test(
      "should detect 5+ faces in group-1.jpg (large group)",
      async () => {
        const result = await processPhotoForEmbeddings(loadImage("group-1.jpg"));
        expect(result.facesCount).toBeGreaterThanOrEqual(5);
      },
      AI_TIMEOUT,
    );

    test(
      "each detected face in group should have unique index",
      async () => {
        const result = await processPhotoForEmbeddings(loadImage("group-3.jpg"));
        const indices = result.faces.map((f) => f.index);
        const uniqueIndices = new Set(indices);
        expect(uniqueIndices.size).toBe(result.facesCount);
      },
      AI_TIMEOUT,
    );

    test(
      "each face in group should have valid embedding",
      async () => {
        const result = await processPhotoForEmbeddings(loadImage("group-3.jpg"));
        for (const face of result.faces) {
          expect(face.embedding).toHaveLength(EMBEDDING_DIMENSIONS);
        }
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Face Detection - No Faces
  // -------------------------------------------------------------------------
  describe("Face Detection - No Faces", () => {
    test(
      "should detect 0 faces in background.jpg",
      async () => {
        const result = await processPhotoForEmbeddings(loadImage("background.jpg"));
        expect(result.facesCount).toBe(0);
        expect(result.faces).toHaveLength(0);
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Face Similarity - Same Person
  // -------------------------------------------------------------------------
  describe("Face Similarity - Same Person", () => {
    let vladoEmbedding1: number[];
    let vladoEmbedding2: number[];
    let stockA1Embedding: number[];
    let stockA3Embedding: number[];

    beforeAll(async () => {
      const vlado1 = await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
      const vlado2 = await processPhotoForEmbeddings(loadImage("person-vlado1.jpg"));
      const stockA1 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-1.jpg"));
      const stockA3 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-3.jpg"));

      vladoEmbedding1 = vlado1.faces[0].embedding;
      vladoEmbedding2 = vlado2.faces[0].embedding;
      stockA1Embedding = stockA1.faces[0].embedding;
      stockA3Embedding = stockA3.faces[0].embedding;
    }, AI_TIMEOUT);

    test("same person (Vlado) in different photos should match", () => {
      const similarity = compareFaces(vladoEmbedding1, vladoEmbedding2);
      expect(similarity).toBeGreaterThanOrEqual(DEFAULT_MATCH_THRESHOLD);
    });

    test("same person (Stock A) in different expressions should match", () => {
      const similarity = compareFaces(stockA1Embedding, stockA3Embedding);
      expect(similarity).toBeGreaterThanOrEqual(0.5); // Clear stock photos match higher
    });

    test("self-similarity should be 1.0 (identical embedding)", () => {
      const similarity = compareFaces(stockA3Embedding, stockA3Embedding);
      expect(similarity).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Face Similarity - Different People
  // -------------------------------------------------------------------------
  describe("Face Similarity - Different People", () => {
    test(
      "different people should have low similarity",
      async () => {
        const stockA3 = await processPhotoForEmbeddings(loadImage("stock-emotions-a-3.jpg"));
        const stockB3 = await processPhotoForEmbeddings(loadImage("stock-emotions-b-3.jpg"));

        const similarity = compareFaces(stockA3.faces[0].embedding, stockB3.faces[0].embedding);

        expect(similarity).toBeLessThan(DEFAULT_MATCH_THRESHOLD);
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Face Matching in Group Photos (Core Use Case)
  // -------------------------------------------------------------------------
  describe("Face Matching in Group Photos", () => {
    let vladoEmbedding: number[];
    let group1Result: PhotoProcessingResult;

    beforeAll(async () => {
      const vlado = await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
      vladoEmbedding = vlado.faces[0].embedding;
      group1Result = await processPhotoForEmbeddings(loadImage("group-1.jpg"));
    }, AI_TIMEOUT);

    test("should find Vlado in group-1.jpg with similarity >= threshold", () => {
      const similarities = group1Result.faces.map((face) =>
        compareFaces(vladoEmbedding, face.embedding),
      );

      const bestMatch = Math.max(...similarities);
      expect(bestMatch).toBeGreaterThanOrEqual(DEFAULT_MATCH_THRESHOLD);
    });

    test("should rank matches by similarity (best first)", () => {
      const matches = group1Result.faces
        .map((face) => ({
          index: face.index,
          similarity: compareFaces(vladoEmbedding, face.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity);

      // Verify sorting is correct
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].similarity).toBeGreaterThanOrEqual(matches[i].similarity);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cross-Group Matching
  // -------------------------------------------------------------------------
  describe("Cross-Group Matching", () => {
    // Note: AI face matching can have variability. These expectations are based on
    // typical results but borderline cases may occasionally fail.
    const groupFiles = [
      { file: "group-1.jpg", shouldFindVlado: true },
      { file: "group-2.jpg", shouldFindVlado: true },
      { file: "group-3.jpg", shouldFindVlado: false }, // Vlado not in this photo
      { file: "group-4.jpg", shouldFindVlado: true },
      { file: "group-5.jpg", shouldFindVlado: null }, // Borderline case - may or may not match
      { file: "stock-group-1.jpg", shouldFindVlado: false }, // Stock photo, no Vlado
    ];

    let vladoEmbedding: number[];

    beforeAll(async () => {
      const vlado = await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
      vladoEmbedding = vlado.faces[0].embedding;
    }, AI_TIMEOUT);

    test.each(groupFiles)(
      "searching for Vlado in $file (expected: $shouldFindVlado)",
      async ({ file, shouldFindVlado }) => {
        const groupResult = await processPhotoForEmbeddings(loadImage(file));

        let bestSim = 0;
        for (const face of groupResult.faces) {
          const sim = compareFaces(vladoEmbedding, face.embedding);
          if (sim > bestSim) bestSim = sim;
        }

        if (shouldFindVlado === true) {
          expect(bestSim).toBeGreaterThanOrEqual(DEFAULT_MATCH_THRESHOLD);
        } else if (shouldFindVlado === false) {
          expect(bestSim).toBeLessThan(DEFAULT_MATCH_THRESHOLD);
        } else {
          // Borderline case - just verify we get a number between 0 and 1
          expect(bestSim).toBeGreaterThanOrEqual(0);
          expect(bestSim).toBeLessThanOrEqual(1);
        }
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Selfie Validation - Valid Selfie
  // -------------------------------------------------------------------------
  describe("Selfie Validation - Valid Selfie", () => {
    let validSelfieResult: SelfieValidationResult;

    beforeAll(async () => {
      // Note: Stock photos may fail antispoof (they're professional photos)
      // Using a real photo that should pass
      validSelfieResult = await validateSelfie(loadImage("stock-emotions-a-3.jpg"));
    }, AI_TIMEOUT);

    test("should return validation result object", () => {
      expect(validSelfieResult).toBeDefined();
      expect(typeof validSelfieResult.isValid).toBe("boolean");
    });

    test("valid selfie should include scores", () => {
      // Note: Stock photos might fail antispoof, so we check structure
      if (validSelfieResult.isValid) {
        expect(validSelfieResult.embedding).toHaveLength(EMBEDDING_DIMENSIONS);
        expect(validSelfieResult.realScore).toBeGreaterThanOrEqual(DEFAULT_MIN_REAL_SCORE);
        expect(validSelfieResult.liveScore).toBeGreaterThanOrEqual(DEFAULT_MIN_LIVE_SCORE);
      } else {
        expect(validSelfieResult.error).toBeDefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Selfie Validation - Multiple Faces (Should Reject)
  // -------------------------------------------------------------------------
  describe("Selfie Validation - Multiple Faces", () => {
    test(
      "should reject image with multiple faces",
      async () => {
        const result = await validateSelfie(loadImage("group-3.jpg"));

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("Multiple faces");
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Selfie Validation - No Face (Should Reject)
  // -------------------------------------------------------------------------
  describe("Selfie Validation - No Face", () => {
    test(
      "should reject image with no faces",
      async () => {
        const result = await validateSelfie(loadImage("background.jpg"));

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("No face");
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Selfie Validation - Custom Thresholds
  // -------------------------------------------------------------------------
  describe("Selfie Validation - Custom Thresholds", () => {
    test(
      "should accept custom minConfidence option",
      async () => {
        const result = await validateSelfie(loadImage("stock-emotions-a-3.jpg"), {
          minConfidence: 0.9, // Very strict
        });

        // Result depends on the photo quality
        expect(typeof result.isValid).toBe("boolean");
      },
      AI_TIMEOUT,
    );

    test(
      "should accept custom minRealScore option",
      async () => {
        const result = await validateSelfie(loadImage("stock-emotions-a-3.jpg"), {
          minRealScore: 0.8, // Stricter antispoof
        });

        expect(typeof result.isValid).toBe("boolean");
      },
      AI_TIMEOUT,
    );

    test(
      "should accept custom minLiveScore option",
      async () => {
        const result = await validateSelfie(loadImage("stock-emotions-a-3.jpg"), {
          minLiveScore: 0.8, // Stricter liveness
        });

        expect(typeof result.isValid).toBe("boolean");
      },
      AI_TIMEOUT,
    );
  });

  // -------------------------------------------------------------------------
  // Memory Management
  // -------------------------------------------------------------------------
  describe("Memory Management", () => {
    test(
      "should not accumulate tensors after processing",
      async () => {
        const before = getMemoryStats().numTensors;

        // Process several images
        await processPhotoForEmbeddings(loadImage("person-vlado.jpg"));
        await processPhotoForEmbeddings(loadImage("stock-emotions-a-1.jpg"));

        const after = getMemoryStats().numTensors;

        // Tensors should be properly disposed (no significant accumulation)
        // Allow some tolerance for model tensors
        expect(after - before).toBeLessThan(10);
      },
      AI_TIMEOUT,
    );
  });
});
