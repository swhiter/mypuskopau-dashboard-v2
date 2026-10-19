// Foto dari kamera HP sering 2-8 MB, sedangkan nginx menolak body > 1 MB.
// Gambar diperkecil di browser sebelum diunggah: sisi terpanjang maksimal
// maxDimension px, disimpan sebagai JPEG (backend hanya menerima jpg/png).

export const PHOTO_MAX_DIMENSION = 1280
// struk vendor perlu tetap terbaca
export const RECEIPT_MAX_DIMENSION = 1600

const JPEG_QUALITY = 0.85
// gambar kecil yang sudah jpg/png dikirim apa adanya
const SKIP_BELOW_BYTES = 300 * 1024

export const fitWithin = (width: number, height: number, max: number): { width: number; height: number } => {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

const isImage = (value: unknown): value is File => value instanceof File && value.type.startsWith('image/')

const decode = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === 'function') {
    // imageOrientation: foto HP yang diputar lewat EXIF tetap tegak
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function resizeImage(file: File, maxDimension = PHOTO_MAX_DIMENSION): Promise<File> {
  if (!isImage(file)) return file

  let source: ImageBitmap | HTMLImageElement
  try {
    source = await decode(file)
  } catch {
    // format yang tidak bisa dibaca browser: biarkan backend yang memvalidasi
    return file
  }

  const { width, height } = fitWithin(source.width, source.height, maxDimension)
  const isAllowedType = file.type === 'image/jpeg' || file.type === 'image/png'
  if (isAllowedType && file.size <= SKIP_BELOW_BYTES && width === source.width) return file

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file
  // latar putih untuk PNG transparan yang diubah ke JPEG
  context.fillStyle = '#fff'
  context.fillRect(0, 0, width, height)
  context.drawImage(source, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob) return file

  const name = file.name.replace(/\.[^.]*$/, '') || 'photo'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}

// Salin FormData dengan semua file gambar diperkecil; field lain tetap urut.
export async function resizeImagesInForm(form: FormData, maxDimension = PHOTO_MAX_DIMENSION): Promise<FormData> {
  const result = new FormData()
  for (const [key, value] of form.entries()) {
    if (isImage(value)) {
      const resized = await resizeImage(value, maxDimension)
      result.append(key, resized, resized.name)
    } else {
      result.append(key, value)
    }
  }
  return result
}
