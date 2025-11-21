export async function processPendingPhotos() {
  console.info("Process photos worker not implemented yet");
}

if (import.meta.main) {
  processPendingPhotos().catch((error) => {
    console.error("Photo worker failed", error);
    process.exit(1);
  });
}
