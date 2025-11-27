/**
 * Face AI Library
 *
 * Provides face detection, embedding extraction, and similarity matching
 * using @vladmandic/human with TensorFlow.js backend.
 *
 * @module face-ai
 * @see {@link initHuman} - Must be called before any detection
 * @see {@link processPhotoForEmbeddings} - Main batch processing function
 * @see {@link validateSelfie} - User selfie validation with antispoof
 * @see {@link compareFaces} - Compare two embeddings for similarity
 *
 * @example Basic usage
 * ```ts
 * import { initHuman, processPhotoForEmbeddings, compareFaces } from "@/lib/face-ai";
 *
 * await initHuman();
 *
 * const photo = await fs.readFile("group.jpg");
 * const result = await processPhotoForEmbeddings(photo);
 *
 * console.log(`Found ${result.facesCount} faces`);
 * ```
 */

import path from "node:path";
import { Human, type Result } from "@vladmandic/human";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const modelsPath = path.resolve(process.cwd(), "node_modules/@vladmandic/human/models");

/**
 * Embedding dimension for the faceres model.
 * Fixed by model architecture - do not change.
 *
 * @remarks
 * The Human library's faceres model produces 1024-dimensional embeddings.
 * This is used for pgvector column sizing: `vector(1024)`.
 */
export const EMBEDDING_DIMENSIONS = 1024;

/**
 * Default minimum confidence for face detection.
 * Faces with scores below this threshold are filtered out.
 * @default 0.5
 */
export const DEFAULT_MIN_CONFIDENCE = 0.5;

/**
 * Default maximum number of faces to detect per image.
 * Increase for very large group photos.
 * @default 50
 */
export const DEFAULT_MAX_DETECTED = 50;

/**
 * Default minimum confidence for selfie validation.
 * Higher than batch processing to ensure quality user profile photos.
 * @default 0.6
 */
export const DEFAULT_SELFIE_MIN_CONFIDENCE = 0.6;

/**
 * Default minimum anti-spoof score for selfie validation.
 * Detects fake/printed/screen photos.
 * @default 0.5
 * @see {@link validateSelfie}
 */
export const DEFAULT_MIN_REAL_SCORE = 0.5;

/**
 * Default minimum liveness score for selfie validation.
 * Detects recordings or static images.
 * @default 0.5
 * @see {@link validateSelfie}
 */
export const DEFAULT_MIN_LIVE_SCORE = 0.5;

/**
 * Similarity threshold for face matching.
 *
 * Human library uses multiplier=20 which normalizes scores so:
 * - Same person: typically 0.40-0.55
 * - Different people: typically 0.20-0.35
 *
 * @default 0.4
 * @see {@link compareFaces}
 */
export const DEFAULT_MATCH_THRESHOLD = 0.4;

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
      maxDetected: DEFAULT_MAX_DETECTED,
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

/**
 * Face detection result with embedding.
 *
 * @see {@link processPhotoForEmbeddings}
 * @since 0.1.0
 */
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

/**
 * Result from processing a photo for face embeddings.
 *
 * @see {@link processPhotoForEmbeddings}
 * @since 0.1.0
 */
export interface PhotoProcessingResult {
  /** Number of faces detected */
  facesCount: number;
  /** Detected faces with embeddings */
  faces: DetectedFace[];
}

/**
 * Result from selfie validation.
 *
 * @see {@link validateSelfie}
 * @since 0.1.0
 */
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
 *
 * Must be called before using any detection functions.
 * Safe to call multiple times (will only initialize once).
 *
 * @throws {Error} If model files cannot be loaded
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * await initHuman();
 * // Now safe to use detection functions
 * ```
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
 *
 * @returns True if {@link initHuman} has completed successfully
 * @since 0.1.0
 */
export function isHumanInitialized(): boolean {
  return isInitialized;
}

// ---------------------------------------------------------------------------
// Core Detection Functions
// ---------------------------------------------------------------------------

/**
 * Decode an image buffer to a tensor for processing.
 *
 * **Important:** Remember to dispose the tensor after use with {@link disposeTensor}!
 *
 * @param buffer - Image file buffer (JPEG, PNG, WebP, GIF)
 * @returns Tensor ready for detection
 *
 * @since 0.1.0
 * @see {@link disposeTensor} - Must be called to prevent memory leaks
 *
 * @example
 * ```ts
 * const tensor = decodeImage(buffer);
 * try {
 *   const result = await detectFaces(tensor);
 * } finally {
 *   disposeTensor(tensor);
 * }
 * ```
 */
export function decodeImage(buffer: Buffer) {
  return human.tf.node.decodeImage(buffer, 3);
}

/**
 * Run face detection on an image tensor.
 *
 * @param tensor - Image tensor from {@link decodeImage}
 * @returns Raw Human detection result
 *
 * @throws {Error} If Human AI is not initialized
 *
 * @since 0.1.0
 * @see {@link decodeImage} - Create tensor from buffer
 * @see {@link processPhotoForEmbeddings} - Higher-level API
 */
export async function detectFaces(tensor: ReturnType<typeof decodeImage>): Promise<Result> {
  if (!isInitialized) {
    throw new Error("[face-ai] Human AI not initialized. Call initHuman() first.");
  }
  return human.detect(tensor);
}

/**
 * Dispose a tensor to free memory.
 *
 * **Always call this after you're done with a tensor!**
 * Failure to dispose tensors will cause memory leaks.
 *
 * @param tensor - Tensor to dispose
 *
 * @since 0.1.0
 * @see {@link decodeImage} - Creates tensors that need disposal
 * @see {@link getMemoryStats} - Monitor tensor count for leaks
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
 * This is the main function for batch processing event photos.
 * It handles tensor lifecycle internally.
 *
 * @param imageBuffer - Image file buffer (JPEG, PNG, WebP, GIF)
 * @returns Processing result with face count and embeddings
 *
 * @throws {Error} If Human AI is not initialized
 *
 * @since 0.1.0
 * @see {@link PhotoProcessingResult} for return type details
 * @see {@link EMBEDDING_DIMENSIONS} for embedding size (1024)
 *
 * @example Basic usage
 * ```ts
 * const buffer = await fs.readFile("group.jpg");
 * const result = await processPhotoForEmbeddings(buffer);
 * console.log(`Found ${result.facesCount} faces`);
 * ```
 *
 * @example Store embeddings in database
 * ```ts
 * const result = await processPhotoForEmbeddings(buffer);
 *
 * await db.update(photos).set({ facesCount: result.facesCount });
 *
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
 * Validate a selfie for user profile registration.
 *
 * Enables antispoof and liveness detection to prevent:
 * - Printed photos
 * - Screen photos
 * - Deepfakes
 *
 * @param imageBuffer - Selfie image buffer (JPEG, PNG)
 * @param options - Validation thresholds
 * @returns Validation result with embedding if valid
 *
 * @throws {Error} If Human AI is not initialized
 *
 * @since 0.1.0
 * @see {@link SelfieValidationResult} for return type details
 * @see {@link DEFAULT_MIN_REAL_SCORE} for antispoof threshold
 * @see {@link DEFAULT_MIN_LIVE_SCORE} for liveness threshold
 *
 * @example Basic validation
 * ```ts
 * const result = await validateSelfie(selfieBuffer);
 *
 * if (!result.isValid) {
 *   throw new Error(result.error);
 * }
 *
 * await db.insert(userEmbeddings).values({
 *   userId: user.id,
 *   embedding: result.embedding,
 * });
 * ```
 *
 * @example With custom thresholds
 * ```ts
 * const result = await validateSelfie(buffer, {
 *   minRealScore: 0.7,  // Stricter antispoof
 *   minLiveScore: 0.7,  // Stricter liveness
 *   minConfidence: 0.8, // Require clearer face
 * });
 * ```
 */
export async function validateSelfie(
  imageBuffer: Buffer,
  options: {
    /**
     * Minimum anti-spoof score (0-1).
     * @default 0.5 (DEFAULT_MIN_REAL_SCORE)
     */
    minRealScore?: number;
    /**
     * Minimum liveness score (0-1).
     * @default 0.5 (DEFAULT_MIN_LIVE_SCORE)
     */
    minLiveScore?: number;
    /**
     * Minimum face detection confidence (0-1).
     * @default 0.6 (DEFAULT_SELFIE_MIN_CONFIDENCE)
     */
    minConfidence?: number;
  } = {},
): Promise<SelfieValidationResult> {
  const {
    minRealScore = DEFAULT_MIN_REAL_SCORE,
    minLiveScore = DEFAULT_MIN_LIVE_SCORE,
    minConfidence = DEFAULT_SELFIE_MIN_CONFIDENCE,
  } = options;

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
 * Uses Euclidean distance with multiplier=20 normalization.
 *
 * @param embedding1 - First face embedding (1024 dimensions)
 * @param embedding2 - Second face embedding (1024 dimensions)
 * @returns Similarity score (0-1, higher = more similar)
 *
 * @since 0.1.0
 * @see {@link DEFAULT_MATCH_THRESHOLD} - Recommended threshold (0.4)
 *
 * @example Basic comparison
 * ```ts
 * const similarity = compareFaces(userEmbedding, photoEmbedding);
 * if (similarity >= DEFAULT_MATCH_THRESHOLD) {
 *   console.log("Match found!");
 * }
 * ```
 *
 * @example Expected similarity ranges
 * ```ts
 * // Same person, different photos: 0.40 - 0.55
 * // Different people: 0.20 - 0.35
 * // Identical embedding: 1.00
 * ```
 */
export function compareFaces(embedding1: number[], embedding2: number[]): number {
  // Using library defaults: multiplier=20 normalizes so 0.5+ = match
  return human.match.similarity(embedding1, embedding2);
}

/**
 * Get memory statistics for the TensorFlow engine.
 *
 * Useful for debugging memory leaks - watch `numTensors` count.
 *
 * @returns Memory stats including numTensors, numBytes, etc.
 *
 * @since 0.1.0
 * @see {@link disposeTensor} - Ensure tensors are properly disposed
 *
 * @example
 * ```ts
 * const stats = getMemoryStats();
 * console.log(`Tensors: ${stats.numTensors}`);
 * console.log(`Memory: ${(stats.numBytes / 1024 / 1024).toFixed(2)} MB`);
 * ```
 */
export function getMemoryStats() {
  return human.tf.memory();
}

/**
 * Get the Human library version.
 *
 * @returns Version string (e.g., "3.3.6")
 * @since 0.1.0
 */
export function getVersion(): string {
  return human.version;
}
