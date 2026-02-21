import { useState } from 'react'
import type { Dog } from '../../types'

interface DogFormProps {
  initialData?: Partial<Dog>
  onSubmit: (data: {
    name: string
    photo_url: string
    story: string
    monthly_amount_usd: number
    monthly_amount_idr: number
  }) => Promise<void>
  submitting: boolean
  submitLabel: string
}

export default function DogForm({ initialData, onSubmit, submitting, submitLabel }: DogFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo_url ?? '')
  const [story, setStory] = useState(initialData?.story ?? '')
  const [amountUsd, setAmountUsd] = useState(String(initialData?.monthly_amount_usd ?? 25))
  const [amountIdr, setAmountIdr] = useState(String(initialData?.monthly_amount_idr ?? 400000))
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    const usd = Number(amountUsd)
    const idr = Number(amountIdr)

    if (!usd || usd <= 0) {
      setError('USD amount must be a positive number')
      return
    }
    if (!idr || idr <= 0) {
      setError('IDR amount must be a positive number')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        photo_url: photoUrl.trim(),
        story: story.trim(),
        monthly_amount_usd: usd,
        monthly_amount_idr: idr,
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dog's name"
          required
          className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
        />
      </div>

      <div>
        <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
          Photo URL
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
        />
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Preview"
            className="mt-2 w-full h-32 object-cover rounded-xl bg-dark"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>

      <div>
        <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
          Story
        </label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tell this dog's rescue story..."
          rows={4}
          className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
            USD / month
          </label>
          <input
            type="number"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            min="1"
            className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
            IDR / month
          </label>
          <input
            type="number"
            value={amountIdr}
            onChange={(e) => setAmountIdr(e.target.value)}
            min="1"
            className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full bg-electric text-black rounded-[14px] py-4 font-extrabold text-base transition-opacity ${
          submitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
