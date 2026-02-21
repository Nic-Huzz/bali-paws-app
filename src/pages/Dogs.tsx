import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDogs } from '../lib/queries'
import type { Dog } from '../types'
import { nameToGradient } from '../utils/nameToGradient'

type Filter = 'all' | 'needs_sponsor' | 'sponsored'

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All dogs' },
  { key: 'needs_sponsor', label: 'Needs sponsor' },
  { key: 'sponsored', label: 'Sponsored' },
]

export default function Dogs() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDogs()
      .then(setDogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredDogs: Dog[] = dogs.filter((dog) => {
    if (activeFilter === 'needs_sponsor') return !dog.is_sponsored
    if (activeFilter === 'sponsored') return dog.is_sponsored
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10">
          <svg
            width="20"
            height="20"
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
        <h1 className="text-lg font-black text-white">Our Dogs</h1>
        <div className="w-10" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2.5 px-6 pb-5 overflow-x-auto scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`whitespace-nowrap py-2.5 px-5 text-sm font-bold rounded-xl transition-colors ${
              activeFilter === filter.key
                ? 'bg-electric text-black'
                : 'bg-charcoal text-gray'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Dog grid */}
      <div className="grid grid-cols-2 gap-3 px-6 pb-8">
        {filteredDogs.map((dog) => (
          <button
            key={dog.id}
            onClick={() => navigate(`/dogs/${dog.id}`)}
            className="text-left transition-transform active:scale-[0.97]"
          >
            {/* Image */}
            <div
              className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${nameToGradient(dog.name)}`}
            >
              {dog.photo_url ? (
                <img
                  src={dog.photo_url}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl text-gray/40">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray/30">
                    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                    <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                    <path d="M8 14v.5" />
                    <path d="M16 14v.5" />
                    <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
                    <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
                  </svg>
                </div>
              )}

              {/* Status badge */}
              <span
                className={`absolute bottom-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                  dog.is_sponsored
                    ? 'bg-teal text-black'
                    : 'bg-electric text-black'
                }`}
              >
                {dog.is_sponsored ? 'Sponsored' : 'Needs sponsor'}
              </span>
            </div>

            {/* Info */}
            <h3 className="font-extrabold text-sm text-white mt-2">
              {dog.name}
            </h3>
            <p className="text-xs text-gray">
              ${dog.monthly_amount_usd}/mo
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
