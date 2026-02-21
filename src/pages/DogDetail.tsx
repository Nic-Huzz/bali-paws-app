import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchDog, fetchDogUpdates } from '../lib/queries'
import type { Dog, DogUpdate } from '../types'
import { nameToGradient } from '../utils/nameToGradient'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DogDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dog, setDog] = useState<Dog | null>(null)
  const [updates, setUpdates] = useState<DogUpdate[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-gray text-sm">Dog not found</p>
        <button
          onClick={() => navigate('/dogs')}
          className="text-electric text-sm font-bold"
        >
          Back to dogs
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Hero image */}
      <div className={`relative h-72 bg-gradient-to-br ${nameToGradient(dog.name)}`}>
        {dog.photo_url ? (
          <img
            src={dog.photo_url}
            alt={dog.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray/30">
              <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
              <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
              <path d="M8 14v.5" />
              <path d="M16 14v.5" />
              <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
              <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
            </svg>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-5 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur rounded-xl"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {/* Content area */}
      <div className="-mt-6 rounded-t-3xl bg-black relative z-10 pt-6 px-6">
        {/* Name + badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white">{dog.name}</h1>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
              dog.is_sponsored
                ? 'bg-teal text-black'
                : 'bg-electric text-black'
            }`}
          >
            {dog.is_sponsored ? 'Sponsored' : 'Needs sponsor'}
          </span>
        </div>

        {/* Story */}
        <p className="text-sm text-gray leading-relaxed mt-3">{dog.story}</p>

        {/* Sponsorship amounts */}
        <div className="bg-dark rounded-2xl p-5 mt-6">
          <h2 className="text-xs font-bold text-gray uppercase tracking-wide mb-3">
            Monthly sponsorship
          </h2>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-white">
                ${dog.monthly_amount_usd}
                <span className="text-sm font-bold text-gray">/mo</span>
              </p>
              <p className="text-xs text-gray mt-0.5">USD</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">
                Rp {Number(dog.monthly_amount_idr).toLocaleString()}
                <span className="text-sm font-bold text-gray">/mo</span>
              </p>
              <p className="text-xs text-gray mt-0.5">IDR</p>
            </div>
          </div>
        </div>

        {/* Updates from the shelter */}
        <div className="mt-8">
          <h2 className="text-base font-black text-white mb-4">
            Updates from the shelter
          </h2>

          {updates.length === 0 ? (
            <p className="text-gray text-sm">No updates yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {updates.map((update) => (
                <div key={update.id} className="flex gap-3">
                  {/* Update image */}
                  <div className="w-12 h-12 rounded-xl bg-charcoal flex-shrink-0 overflow-hidden">
                    {update.photo_url ? (
                      <img
                        src={update.photo_url}
                        alt="Shelter update"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>

                  {/* Update text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-relaxed line-clamp-3">
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
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-dark border-t border-charcoal z-40 px-5 py-4">
        {dog.is_sponsored ? (
          <div className="w-full bg-charcoal text-gray font-extrabold text-center rounded-[14px] py-4 text-sm">
            Sponsored by a donor
          </div>
        ) : (
          <Link
            to="/donate"
            className="block w-full bg-electric text-black font-extrabold text-center rounded-[14px] py-4 text-sm transition-transform active:scale-[0.98]"
          >
            Sponsor {dog.name} &mdash; ${dog.monthly_amount_usd}/mo
          </Link>
        )}
      </div>
    </div>
  )
}
