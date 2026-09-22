export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileSizeBytes?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 300; // minimum width or height in px

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a JPG, PNG, or WebP photo.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Photo exceeds the maximum limit of 10MB.",
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          resolve({
            valid: false,
            error: `Photo is too small (${img.width}×${img.height}). Minimum recommended is 400×500px for sharp garment transfer.`,
            width: img.width,
            height: img.height,
          });
          return;
        }

        resolve({
          valid: true,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          fileSizeBytes: file.size,
        });
      };
      img.onerror = () => {
        resolve({
          valid: false,
          error: "Failed to decode the image file. Please try another file.",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({
        valid: false,
        error: "Unable to read selected file.",
      });
    };
    reader.readAsDataURL(file);
  });
}
