type CropArea = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export async function getCroppedImage(
  file: File,
  crop: CropArea,
  rotation = 0
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = await createImage(url);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported");
    }

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const width = image.width;
    const height = image.height;
    const boundWidth = Math.floor(width * cos + height * sin);
    const boundHeight = Math.floor(width * sin + height * cos);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      throw new Error("Canvas is not supported");
    }

    tempCanvas.width = boundWidth;
    tempCanvas.height = boundHeight;
    tempCtx.translate(boundWidth / 2, boundHeight / 2);
    tempCtx.rotate(radians);
    tempCtx.drawImage(image, -width / 2, -height / 2);

    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      tempCanvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Crop failed"));
          return;
        }
        resolve(blob);
      }, file.type || "image/jpeg");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
