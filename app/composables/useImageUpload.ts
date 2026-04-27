/**
 * useImageUpload — 图片处理与上传
 *
 * 流程：
 * 1. 用户选择图片文件（jpg/png/gif/webp）
 * 2. Canvas API 转换为 WebP（质量 0.85）
 * 3. Base64 上传到 imgbb
 * 4. 返回图片 URL
 */

export interface UploadResult {
  url: string      // 原图 URL
    thumb: string    // 缩略图 URL
}

export interface UploadProgress {
  file: string
  status: 'pending' | 'converting' | 'uploading' | 'done' | 'error'
  error?: string
  result?: UploadResult
}

export function useImageUpload() {
  const config = useRuntimeConfig()

  /** 将 File 转换为 WebP Blob（Canvas API） */
  function convertToWebP(file: File, quality = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas 不可用'))
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('WebP 转换失败'))
          },
          'image/webp',
          quality,
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片读取失败'))
      }

      img.src = url
    })
  }

  /** Blob 转 Base64 字符串（不含 data URL 前缀） */
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 去掉 "data:image/webp;base64," 前缀
        resolve(result.split(',')[1])
      }
      reader.onerror = () => reject(new Error('FileReader 读取失败'))
      reader.readAsDataURL(blob)
    })
  }

  /** 上传单张图片到 imgbb */
  async function uploadToImgbb(base64: string): Promise<UploadResult> {
    const apiKey = config.public.imgbbApiKey
    if (!apiKey) throw new Error('imgbb API Key 未配置')

    const formData = new FormData()
    formData.append('key', apiKey)
    formData.append('image', base64)

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error(`imgbb 上传失败: ${res.status}`)

    const json = await res.json()
    if (!json.success) throw new Error(json.error?.message || 'imgbb 返回错误')

    return {
      url: json.data.display_url,
        thumb: json.data.thumb?.url || json.data.display_url,
    }
  }

  /**
   * 批量上传图片
   * @param files   图片文件数组
   * @param onProgress  进度回调
   */
  async function uploadImages(
    files: File[],
    onProgress?: (progress: UploadProgress[]) => void,
  ): Promise<UploadResult[]> {
    const progress: UploadProgress[] = files.map(f => ({
      file: f.name,
      status: 'pending',
    }))

    const notify = () => onProgress?.([...progress])
    notify()

    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Step 1: 转换为 WebP
      progress[i].status = 'converting'
      notify()

      let base64: string
      try {
        const blob = await convertToWebP(file)
        base64 = await blobToBase64(blob)
      }
      catch (e: unknown) {
        progress[i].status = 'error'
        progress[i].error = e instanceof Error ? e.message : 'WebP 转换失败'
        notify()
        continue
      }

      // Step 2: 上传到 imgbb（失败自动重试一次）
      progress[i].status = 'uploading'
      notify()

      let result: UploadResult | null = null
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          result = await uploadToImgbb(base64)
          break
        }
        catch (e: unknown) {
          if (attempt === 1) {
            progress[i].status = 'error'
            progress[i].error = e instanceof Error ? e.message : '上传失败'
            notify()
          }
        }
      }

      if (result) {
        progress[i].status = 'done'
        progress[i].result = result
        results.push(result)
        notify()
      }
    }

    return results
  }

  return {
    uploadImages,
  }
}
