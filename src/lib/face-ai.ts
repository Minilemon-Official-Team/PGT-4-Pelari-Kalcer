/**
 * Face AI Library
 *
 * Provides face detection, embedding extraction, and similarity matching
 * using @vladmandic/human with TensorFlow.js backend.
 *
 * @module face-ai
 */

import path from "node:path";
import { Human, type Result } from "@vladmandic/human";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const modelsPath = path.resolve(process.cwd(), "node_modules/@vladmandic/human/models");

/** Embedding dimension for the faceres model */
export const EMBEDDING_DIMENSIONS = 1024;

/** Default minimum confidence for face detection */
export const DEFAULT_MIN_CONFIDENCE = 0.5;

// ---------------------------------------------------------------------------
// Human Instance
// ---------------------------------------------------------------------------

const human = new Human({
  backend: "tensorflow",
  modelBasePath: `file://${modelsPath}/`,
  face: {
    enabled: true,
    detector: {
      enabled: true,
      modelPath: "blazeface.json",
      minConfidence: DEFAULT_MIN_CONFIDENCE,
    },
    mesh: { enabled: true, modelPath: "facemesh.json" },
    description: { enabled: true, modelPath: "faceres.json" },
    iris: { enabled: false },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Face detection result with embedding */
export interface DetectedFace {
  /** Face index in the image (0-based) */
  index: number;
  /** Face embedding vector (1024 dimensions for faceres) */
  embedding: number[];
  /** Bounding box [x, y, width, height] normalized 0-1 */
  box: [number, number, number, number];
  /** Detection confidence score (0-1) */
  confidence: number;
  /** Estimated age */
  age?: number;
  /** Detected gender */
  gender?: "male" | "female";
  /** Gender detection confidence (0-1) */
  genderScore?: number;
}

/** Result from processing a photo for face embeddings */
export interface PhotoProcessingResult {
  /** Number of faces detected */
  facesCount: number;
  /** Detected faces with embeddings */
  faces: DetectedFace[];
}

/** Result from selfie validation */
export interface SelfieValidationResult {
  /** Whether the selfie is valid */
  isValid: boolean;
  /** Validation error message if invalid */
  error?: string;
  /** Face embedding if valid */
  embedding?: number[];
  /** Anti-spoof score (0-1, higher = more real) */
  realScore?: number;
  /** Liveness score (0-1, higher = more live) */
  liveScore?: number;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

let isInitialized = false;

/**
 * Initialize the Human AI library.
 * Must be called before using any detection functions.
 * Safe to call multiple times (will only initialize once).
 */
export async function initHuman(): Promise<void> {
  if (isInitialized) return;

  console.info("[face-ai] Initializing Human AI with tensorflow backend...");
  console.info(`[face-ai] Models path: file://${modelsPath}/`);

  await human.load();
  await human.warmup();

  isInitialized = true;
  console.info("[face-ai] Human AI initialized successfully");
}

/**
 * Check if the Human AI library is initialized.
 */
export function isHumanInitialized(): boolean {
  return isInitialized;
}

// ---------------------------------------------------------------------------
// Core Detection Functions
// ---------------------------------------------------------------------------

/**
 * Decode an image buffer to a tensor for processing.
 * Remember to dispose the tensor after use!
 *
 * @param buffer - Image file buffer (JPEG, PNG, etc.)
 * @returns Tensor ready for detection
 */
export function decodeImage(buffer: Buffer) {
  return human.tf.node.decodeImage(buffer, 3);
}

/**
 * Run face detection on an image tensor.
 *
 * @param tensor - Image tensor from decodeImage()
 * @returns Raw Human detection result
 */
export async function detectFaces(tensor: ReturnType<typeof decodeImage>): Promise<Result> {
  if (!isInitialized) {
    throw new Error("[face-ai] Human AI not initialized. Call initHuman() first.");
  }
  return human.detect(tensor);
}

/**
 * Dispose a tensor to free memory.
 * Always call this after you're done with a tensor!
 *
 * @param tensor - Tensor to dispose
 */
export function disposeTensor(tensor: ReturnType<typeof decodeImage>): void {
  human.tf.dispose(tensor);
}

// ---------------------------------------------------------------------------
// Photo Processing
// ---------------------------------------------------------------------------

/**
 * Process a photo to extract all face embeddings.
 *
 * @param imageBuffer - Image file buffer
 * @returns Processing result with face count and embeddings
 *
 * @example
 * ```ts
 * const buffer = await fetchImageFromS3(photoId);
 * const result = await processPhotoForEmbeddings(buffer);
 *
 * // Update photo record
 * await db.update(photos).set({ facesCount: result.facesCount });
 *
 * // Store each face embedding
 * for (const face of result.faces) {
 *   await db.insert(photoEmbeddings).values({
 *     photoId,
 *     embedding: face.embedding,
 *   });
 * }
 * ```
 */
export async function processPhotoForEmbeddings(
  imageBuffer: Buffer,
): Promise<PhotoProcessingResult> {
  if (!isInitialized) {
    throw new Error("[face-ai] Human AI not initialized. Call initHuman() first.");
  }

  const tensor = decodeImage(imageBuffer);

  try {
    const result = await human.detect(tensor);

    const faces: DetectedFace[] = result.face
      .filter((face): face is typeof face & { embedding: number[] } =>
        Boolean(face.embedding && face.embedding.length === EMBEDDING_DIMENSIONS),
      )
      .map((face, index) => ({
        index,
        embedding: face.embedding,
        box: face.boxRaw as [number, number, number, number],
        confidence: face.faceScore,
        age: face.age,
        gender: face.gender as "male" | "female" | undefined,
        genderScore: face.genderScore,
      }));

    return {
      facesCount: faces.length,
      faces,
    };
  } finally {
    disposeTensor(tensor);
  }
}

// ---------------------------------------------------------------------------
// Selfie Validation
// ---------------------------------------------------------------------------

/**
 * Validate a selfie.
 * Enables antispoof and liveness detection for security.
 *
 * @param imageBuffer - Selfie image buffer
 * @param options - Validation options
 * @returns Validation result with embedding if valid
 *
 * @example
 * ```ts
 * const result = await validateSelfie(selfieBuffer);
 *
 * if (!result.isValid) {
 *   throw new Error(result.error);
 * }
 *
 * // Store the validated embedding
 * await db.insert(userEmbeddings).values({
 *   userId: user.id,
 *   embedding: result.embedding,
 * });
 * ```
 */
export async function validateSelfie(
  imageBuffer: Buffer,
  options: {
    /** Minimum anti-spoof score (0-1). Default: 0.5 */
    minRealScore?: number;
    /** Minimum liveness score (0-1). Default: 0.5 */
    minLiveScore?: number;
    /** Minimum face confidence (0-1). Default: 0.6 */
    minConfidence?: number;
  } = {},
): Promise<SelfieValidationResult> {
  const { minRealScore = 0.5, minLiveScore = 0.5, minConfidence = 0.6 } = options;

  if (!isInitialized) {
    throw new Error("[face-ai] Human AI not initialized. Call initHuman() first.");
  }

  const tensor = decodeImage(imageBuffer);

  try {
    // Run detection with antispoof and liveness enabled
    const result = await human.detect(tensor, {
      face: {
        antispoof: { enabled: true, modelPath: "antispoof.json" },
        liveness: { enabled: true, modelPath: "liveness.json" },
      },
    });

    // Check if any face was detected
    if (result.face.length === 0) {
      return { isValid: false, error: "No face detected in the image" };
    }

    // Check if multiple faces detected
    if (result.face.length > 1) {
      return {
        isValid: false,
        error: "Multiple faces detected. Please upload a photo with only your face",
      };
    }

    const face = result.face[0];

    // Check detection confidence
    if (face.faceScore < minConfidence) {
      return { isValid: false, error: "Face not clearly visible. Please upload a clearer photo" };
    }

    // Check embedding exists
    if (!face.embedding || face.embedding.length !== EMBEDDING_DIMENSIONS) {
      return { isValid: false, error: "Could not extract face features. Please try another photo" };
    }

    // Check anti-spoof score
    const realScore = face.real ?? 0;
    if (realScore < minRealScore) {
      return {
        isValid: false,
        error: "Photo appears to be fake or computer-generated",
        realScore,
      };
    }

    // Check liveness score
    const liveScore = face.live ?? 0;
    if (liveScore < minLiveScore) {
      return {
        isValid: false,
        error: "Photo appears to be a recording or printout",
        liveScore,
      };
    }

    return {
      isValid: true,
      embedding: face.embedding,
      realScore,
      liveScore,
    };
  } finally {
    disposeTensor(tensor);
  }
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Compare two face embeddings and return similarity score.
 *
 * @param embedding1 - First face embedding
 * @param embedding2 - Second face embedding
 * @returns Similarity score (0-1, higher = more similar)
 *
 * @example
 * ```ts
 * const similarity = compareFaces(userEmbedding, photoEmbedding);
 * if (similarity >= 0.4) {
 *   console.log("Match found!");
 * }
 * ```
 */
export function compareFaces(embedding1: number[], embedding2: number[]): number {
  // Using library defaults: multiplier=20 normalizes so 0.5+ = match
  return human.match.similarity(embedding1, embedding2);
}

/**
 * Get memory statistics for the TensorFlow engine.
 * Useful for debugging memory leaks.
 */
export function getMemoryStats() {
  return human.tf.memory();
}

/**
 * Get the Human library version.
 */
export function getVersion(): string {
  return human.version;
}

// ---------------------------------------------------------------------------
// CLI Test
// ---------------------------------------------------------------------------

if (import.meta.main) {
  await initHuman();

  const fs = await import("node:fs");

  // Test 1: Same person (Vlado) - different photos
  const vlado1 = path.resolve(process.cwd(), "public/samples", "person-vlado.jpg");
  const vlado2 = path.resolve(process.cwd(), "public/samples", "person-vlado1.jpg");

  console.info("\n=== Test 1: Same person (Vlado), different photos ===");
  const bufferV1 = fs.readFileSync(vlado1);
  const bufferV2 = fs.readFileSync(vlado2);

  const resultV1 = await processPhotoForEmbeddings(bufferV1);
  const resultV2 = await processPhotoForEmbeddings(bufferV2);

  if (resultV1.faces.length >= 1 && resultV2.faces.length >= 1) {
    const similarity = compareFaces(resultV1.faces[0].embedding, resultV2.faces[0].embedding);
    console.info(`Vlado vs Vlado similarity: ${similarity.toFixed(4)}`);
  }

  // Test 2: Stock photo set A
  console.info("\n=== Test 2: Stock emotions A ===");
  const stockA1 = path.resolve(process.cwd(), "public/samples", "stock-emotions-a-1.jpg");
  const stockA3 = path.resolve(process.cwd(), "public/samples", "stock-emotions-a-3.jpg");

  const bufferA1 = fs.readFileSync(stockA1);
  const bufferA3 = fs.readFileSync(stockA3);

  const resultA1 = await processPhotoForEmbeddings(bufferA1);
  const resultA3 = await processPhotoForEmbeddings(bufferA3);
  if (resultA1.faces.length >= 1 && resultA3.faces.length >= 1) {
    const similarity = compareFaces(resultA1.faces[0].embedding, resultA3.faces[0].embedding);
    console.info(`Stock A1 vs A3 similarity: ${similarity.toFixed(4)}`);
  }

  // Test 3: Different people (Stock A vs Stock B)
  console.info("\n=== Test 3: Different people (Stock A vs Stock B) ===");
  const stockB3 = path.resolve(process.cwd(), "public/samples", "stock-emotions-b-3.jpg");
  const bufferB3 = fs.readFileSync(stockB3);
  const resultB3 = await processPhotoForEmbeddings(bufferB3);

  if (resultA3.faces.length >= 1 && resultB3.faces.length >= 1) {
    const similarity = compareFaces(resultA3.faces[0].embedding, resultB3.faces[0].embedding);
    console.info(`Stock A3 vs B3 similarity: ${similarity.toFixed(4)}`);
  }

  // Test 4: Self-similarity (should be 1.0)
  console.info("\n=== Test 4: Self-similarity (same image) ===");
  if (resultA3.faces.length >= 1) {
    const similarity = compareFaces(resultA3.faces[0].embedding, resultA3.faces[0].embedding);
    console.info(`Self-similarity: ${similarity.toFixed(4)} (should be 1.0)`);
  }

  console.info("\n[Test] Memory stats:", getMemoryStats());
}
