# RunCam Feature Specification (MVP)

Version: 1.0

Timeline: 25 Nov - 12 Dec 2025

## 1. Overview

RunCam is a web platform connecting event photographers with runners using facial recognition.

Core Loop: Creator uploads photos $\rightarrow$ System indexes faces $\rightarrow$ User uploads selfie $\rightarrow$ System finds matches.

## 2. User Roles

1. **Member:** Standard user. Can register face, search for photos, and claim them.
2. **Creator (Verified):** Can upload photo batches and manage albums.
3. **Admin:** Verifies creators, manages Events, and moderates flagged photos.

## 3. Authentication & Onboarding

### 3.1 Registration

- **Flow:** Sign Up (Email/Username/Password) $\rightarrow$ **Mandatory Face Registration** $\rightarrow$ Dashboard.
- **Face Registration:**
  - User uploads a clear selfie or uses the webcam.
  - System validates the selfie (antispoof + liveness detection) and generates a **1024-float Vector** via `@vladmandic/human` (`faceres` model) and stores it in `user_embeddings`.
  - _Constraint:_ User cannot access any other features until a face is registered.

### 3.2 Creator Verification

- **Request:** Member fills a form (Portfolio Link, Motivation).
- **Approval:** Admin dashboard lists pending requests. Admin clicks “Approve” $\rightarrow$ User role updates to `creator`.
- **Settings:** Creators must populate a “Contact Info” field (WhatsApp/Email) in their User Settings before uploading.

## 4. Photo Management (Creator Workflow)

### 4.1 Upload Specifications

- **Supported Formats:** JPEG/JPG, PNG, WEBP.
- **Limits:** Max **10MB** per file. Max **20 photos** per batch upload.
- **Metadata:** Creator selects an **Event** (optional) for the batch. Date extracted from EXIF if possible.

### 4.2 Processing Pipeline (Server Worker)

- **Trigger:** Occurs immediately after file upload to Storage.
- **Action 1 (AI):** Detect faces via `@vladmandic/human` $\rightarrow$ Generate 1024-dim embeddings $\rightarrow$ Store in `photo_embeddings`.
- **Action 2 (Image):** Generate a **Display Copy**:
  - Resized (e.g., 1080p height).
  - **Watermarked** (Diagonal text overlay).
  - Compressed (Quality ~80%).
- **Storage:**
  - **Original:** Stored in Private Bucket (Accessible only to Creator).
  - **Display Copy:** Stored in Public Bucket (Visible in search).

## 5. The Matching Engine (Core Experience)

### 5.1 “Find Me” Search

- **Action:** User clicks “Find Me” on Dashboard.
- **Logic:** Database query comparing `user_embedding` vs `photo_embedding` using pgvector L2/Euclidean Distance (`<->`).
- **Results:** Return photos with similarity score above threshold (calibrated based on testing, typically ~0.4 for Human’s `faceres` model).
- **Filtering:** Users can refine results by **Event**, **Date**, or **Accuracy Threshold** (UI Slider).

### 5.2 Claiming

- **Action:** User clicks “This is me” on a specific photo.
- **Result:**
  - System records a `claim`.
  - UI reveals the Creator's **Contact Info** (e.g., "Chat on WhatsApp to get High-Res").
  - _Note:_ Payment and high-res transfer happen _off-platform_ for this MVP.

### 5.3 Takedowns (Privacy)

- **Action:** User clicks “Remove/Hide this photo”.
- **Result:** Photo status updates to `hidden`. It is immediately removed from all public search results.
- **Moderation:** Flagged photo appears in Admin Dashboard for permanent deletion review.

## 6. Event Discovery

- **Event Creation:** Admin creates Events (Name, Date, Location, Picture).
- **Gallery:** Users can browse photos tagged with an Event. All photos displayed are the **Watermarked Display Copy**.

## 7. Data Lifecycle & Constraints

- **Retention:** Unclaimed photos are auto-deleted **30 days** after upload via Cron Job.
- **Account Deletion:** Deleting an account permanently removes the User's Face Vector and Personal Data.
