import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchDogs, deleteDog } from '../../lib/queries'
import type { Dog } from '../../types'

export default function AdminDogs() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDogs()
  }, [])

  async function loadDogs() {
    try {
      const data = await fetchDogs()
      setDogs(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(dog: Dog) {
    if (!window.confirm(`Delete ${dog.name}? This cannot be undone.`)) return

    try {
      await deleteDog(dog.id)
      setDogs((prev) => prev.filter((d) => d.id !== dog.id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">Dogs</h2>
        <Link
          to="/admin/dogs/new"
          className="bg-electric text-black px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          + Add Dog
        </Link>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
        </div>
      ) : dogs.length === 0 ? (
        <p className="text-gray text-sm text-center py-12">No dogs yet. Add your first dog!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-dark rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl bg-charcoal flex-shrink-0 overflow-hidden">
                {dog.photo_url ? (
                  <img
                    src={dog.photo_url}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray/40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                      <path d="M8 14v.5" />
                      <path d="M16 14v.5" />
                      <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
                      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-white text-sm">{dog.name}</h3>
                <p className="text-xs text-gray">
                  ${dog.monthly_amount_usd}/mo
                  {dog.is_sponsored && (
                    <span className="ml-2 text-teal">Sponsored</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/dogs/${dog.id}`)}
                  className="text-xs font-bold text-electric bg-electric/10 px-3 py-1.5 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dog)}
                  className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
