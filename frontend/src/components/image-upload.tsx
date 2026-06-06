import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { mediaUrl } from '@/lib/utils'
import { Upload, X, ImageIcon } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
}

export function ImageUpload({ value, onChange, onClear }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB'); return }

    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      onChange(url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const preview = mediaUrl(value)

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-border/60 bg-muted">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" /> Change
            </Button>
            {onClear && (
              <Button type="button" size="sm" variant="destructive" onClick={onClear}>
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/2 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary"
        >
          {uploading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
