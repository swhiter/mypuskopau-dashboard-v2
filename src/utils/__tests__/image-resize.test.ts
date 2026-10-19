import { afterEach, describe, expect, it, vi } from 'vitest'
import { fitWithin, resizeImage, resizeImagesInForm } from '../image-resize'

const fakeCanvas = () => {
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: '' }),
    toBlob: (resolve: (blob: Blob) => void) => resolve(new Blob(['x'.repeat(100)], { type: 'image/jpeg' }))
  }
  const original = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) =>
    tag === 'canvas' ? canvas : original(tag)) as typeof document.createElement)
  return canvas
}

const bigFile = (name: string, type: string) => new File([new Uint8Array(2 * 1024 * 1024)], name, { type })

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('fitWithin', () => {
  it('scales the longest side down and never enlarges', () => {
    expect(fitWithin(4000, 3000, 1280)).toEqual({ width: 1280, height: 960 })
    expect(fitWithin(3000, 4000, 1280)).toEqual({ width: 960, height: 1280 })
    expect(fitWithin(800, 600, 1280)).toEqual({ width: 800, height: 600 })
  })
})

describe('resizeImage', () => {
  it('shrinks a large photo into a jpg', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 4000, height: 3000 }))
    const canvas = fakeCanvas()

    const result = await resizeImage(bigFile('IMG_001.PNG', 'image/png'))

    expect([canvas.width, canvas.height]).toEqual([1280, 960])
    expect(result.name).toBe('IMG_001.jpg')
    expect(result.type).toBe('image/jpeg')
    expect(result.size).toBeLessThan(1024 * 1024)
  })

  it('keeps small jpg/png as is', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 600, height: 400 }))
    const small = new File(['abc'], 'kecil.jpg', { type: 'image/jpeg' })

    expect(await resizeImage(small)).toBe(small)
  })

  it('returns the original file when the browser cannot decode it', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('unsupported')))
    const heic = bigFile('foto.heic', 'image/heic')

    expect(await resizeImage(heic)).toBe(heic)
  })
})

describe('resizeImagesInForm', () => {
  it('resizes image files and keeps other fields in order', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 3000, height: 3000 }))
    fakeCanvas()
    const pdf = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    const form = new FormData()
    form.append('name', 'Budi')
    form.append('photo', bigFile('a.jpeg', 'image/jpeg'))
    form.append('doc', pdf)

    const result = await resizeImagesInForm(form)

    const entries = [...result.entries()]
    expect(entries.map(([key]) => key)).toEqual(['name', 'photo', 'doc'])
    expect(entries[0][1]).toBe('Budi')
    expect((entries[1][1] as File).name).toBe('a.jpg')
    expect((entries[2][1] as File).name).toBe('doc.pdf')
  })
})
