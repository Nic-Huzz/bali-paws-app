import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import DogForm from '../../components/admin/DogForm'
import { fetchDog, fetchDogUpdates, updateDog, createDogUpdate } from '../../lib/queries'
import { useAuth } from '../../contexts/AuthContext'
import type { Dog, DogUpdate } from '../../types'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminDogEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dog, setDog] = useState<Dog | null>(null)
  const [updates, setUpdates] = useState<DogUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Update form state
  const [updateCaption, setUpdateCaption] = useState('')
  const [updatePhotoUrl, setUpdatePhotoUrl] = useState('')
  const [postingUpdate, setPostingUpdate] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([fetchDog(id), fetchDogUpdates(id)])
      .then(([dogData, updatesData]) => {
        setDog(dogData)
        setUpdates(updatesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(data: {
    name: string
    photo_url: string
    story: string
    monthly_amount_usd: number
    monthly_amount_idr: number
  }) {
    if (!id) return
    setSubmitting(true)
    try {
      const updated = await updateDog(id, data)
      setDog(updated)
      navigate('/admin')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !user || !updateCaption.trim()) return
    setUpdateError(null)
    setPostingUpdate(true)

    try {
      const newUpdate = await createDogUpdate({
        dog_id: id,
        caption: updateCaption.trim(),
        photo_url: updatePhotoUrl.trim() || undefined,
        posted_by: user.id,
      })
      setUpdates((prev) => [newUpdate, ...prev])
      setUpdateCaption('')
      setUpdatePhotoUrl('')
    } catch (err: any) {
      setUpdateError(err.message)
    } finally {
      setPostingUpdate(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!dog) {
    return (
      <AdminLayout>
        <p className="text-gray text-sm">Dog not found.</p>
        <Link to="/admin" className="text-electric text-sm font-bold mt-2 inline-block">
          Back to dogs
        </Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link to="/admin" className="text-xs text-gray font-bold hover:text-white transition-colors">
          &larr; Back to dogs
        </Link>
        <h2 className="text-xl font-black text-white mt-2">Edit {dog.name}</h2>
      </div>

      <DogForm
        initialData={dog}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
      />

      {/* Shelter Updates Section */}
      <div className="mt-10 pt-8 border-t border-charcoal">
        <h3 className="text-lg font-black text-white mb-5">Shelter Updates</h3>

        {/* Post new update */}
        <form onSubmit={handlePostUpdate} className="bg-dark rounded-2xl p-5 mb-6">
          <h4 className="text-sm font-bold text-white mb-3">Post an update</h4>

          <textarea
            value={updateCaption}
            onChange={(e) => setUpdateCaption(e.target.value)}
            placeholder="Write an update about this dog..."
            rows={3}
            required
            className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40 resize-none mb-3"
          />

          <input
            type="url"
            value={updatePhotoUrl}
            onChange={(e) => setUpdatePhotoUrl(e.target.value)}
            placeholder="Photo URL (optional)"
            className="w-full bg-charcoal rounded-xl px-4 py-3.5 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40 mb-3"
          />

          {updateError && (
            <p className="text-red-400 text-sm mb-3">{updateError}</p>
          )}

          <button
            type="submit"
            disabled={postingUpdate || !updateCaption.trim()}
            className={`bg-teal text-black rounded-xl px-5 py-2.5 font-bold text-sm transition-opacity ${
              postingUpdate || !updateCaption.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {postingUpdate ? 'Posting...' : 'Post Update'}
          </button>
        </form>

        {/* Existing updates */}
        {updates.length === 0 ? (
          <p className="text-gray text-sm">No updates yet for this dog.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {updates.map((update) => (
              <div key={update.id} className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-charcoal flex-shrink-0 overflow-hidden">
                  {update.photo_url ? (
                    <img
                      src={update.photo_url}
                      alt="Update"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-relaxed">
                    {update.caption}
                  </p>
                  <p className="text-xs text-gray mt-1">
                    {formatDate(update.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
