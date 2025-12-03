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

/** Maximum number of faces to detect per image */
export const DEFAULT_MAX_DETECTED = 50;

/** Default minimum confidence for selfie validation */
export const DEFAULT_SELFIE_MIN_CONFIDENCE = 0.6;

/** Default minimum anti-spoof score for selfie validation */
export const DEFAULT_MIN_REAL_SCORE = 0.5;

/** Default minimum liveness score for selfie validation */
export const DEFAULT_MIN_LIVE_SCORE = 0.5;

/** Similarity threshold for face matching */
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

/** Check if the Human AI library is initialized. */
export function isHumanInitialized(): boolean {
  return isInitialized;
}

// ---------------------------------------------------------------------------
// Core Detection Functions
// ---------------------------------------------------------------------------

/**
 * Decode an image buffer to a tensor for processing.
 * Remember to dispose the tensor after use!
 */
export function decodeImage(buffer: Buffer) {
  return human.tf.node.decodeImage(buffer, 3);
}

/** Run face detection on an image tensor. */
export async function detectFaces(tensor: ReturnType<typeof decodeImage>): Promise<Result> {
  if (!isInitialized) {
    throw new Error("[face-ai] Human AI not initialized. Call initHuman() first.");
  }
  return human.detect(tensor);
}

/** Dispose a tensor to free memory. */
export function disposeTensor(tensor: ReturnType<typeof decodeImage>): void {
  human.tf.dispose(tensor);
}

// ---------------------------------------------------------------------------
// Photo Processing
// ---------------------------------------------------------------------------

/** Process a photo to extract all face embeddings. */
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
 * Enables antispoof and liveness detection.
 */
export async function validateSelfie(
  imageBuffer: Buffer,
  options: {
    minRealScore?: number;
    minLiveScore?: number;
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

/** Compare two face embeddings and return similarity score (0-1). */
export function compareFaces(embedding1: number[], embedding2: number[]): number {
  // Using library defaults: multiplier=20 normalizes so 0.5+ = match
  return human.match.similarity(embedding1, embedding2);
}

/** Get memory statistics for the TensorFlow engine. */
export function getMemoryStats() {
  return human.tf.memory();
}

/** Get the Human library version. */
export function getVersion(): string {
  return human.version;
}
