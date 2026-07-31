// Redimensiona e recomprime uma imagem no navegador antes do upload — uma
// foto de câmera de celular moderna facilmente passa de 5-8MB, e nada no
// app limitava isso antes (nem no cliente, nem no bucket do Supabase).
// Usa <canvas> puro (sem dependência nova); funciona em qualquer navegador
// com suporte a File/Canvas, incluindo webviews mais antigas.
export function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<File> {
  return new Promise(resolve => {
    if (!file.type.startsWith('image/')) { resolve(file); return }

    const reader = new FileReader()
    reader.onerror = () => resolve(file)
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => resolve(file)
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(file); return }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (!blob) { resolve(file); return }
          const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
          resolve(new File([blob], newName, { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
