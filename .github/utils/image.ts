
/**
 * Processes an image file: resizes if it exceeds a maximum width and/or compresses
 * if it exceeds a maximum file size.
 *
 * @param file The original image file.
 * @param maxSizeMB The maximum desired file size in megabytes.
 * @param maxWidth The maximum desired width in pixels. A value of 0 means no resizing.
 * @param quality The quality level for JPEG compression (0.0 to 1.0).
 * @returns A promise that resolves to the processed file, or the original file if no processing was needed.
 */
// FIX: Removed `async` keyword to avoid returning a nested promise (`Promise<Promise<File>>`).
// This ensures the function consistently returns `Promise<File>`, fixing the type error.
export const compressImage = (
  file: File,
  maxSizeMB: number,
  maxWidth: number,
  quality = 0.85
): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    // FIX: Explicitly return a resolved promise to match the function's return type.
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      const needsResize = maxWidth > 0 && img.width > maxWidth;
      const needsCompress = file.size > maxSizeMB * 1024 * 1024;

      if (!needsResize && !needsCompress) {
        return resolve(file);
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Failed to get canvas context.'));
      }

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (needsResize) {
        targetWidth = maxWidth;
        targetHeight = img.height * (maxWidth / img.width);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed.'));
          }
          
          const newFileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
          const processedFile = new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          // If no compression was intended and resizing made it bigger, return original
          if (!needsCompress && processedFile.size > file.size) {
             resolve(file);
          } else {
             resolve(processedFile);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(error);
    };
  });
};
