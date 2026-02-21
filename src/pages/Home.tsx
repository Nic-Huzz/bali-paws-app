import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatPill from '../components/StatPill'
import DogCard from '../components/DogCard'
import CurrencyToggle from '../components/CurrencyToggle'
import { fetchDogs, fetchDogStats } from '../lib/queries'
import type { Dog } from '../types'

const AMOUNTS_USD = [10, 25, 50, 100] as const
const AMOUNTS_IDR = [150_000, 400_000, 750_000, 1_500_000] as const

function formatAmount(amount: number, currency: 'USD' | 'IDR'): string {
  if (currency === 'IDR') {
    return amount >= 1_000_000
      ? `Rp ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
      : `Rp ${amount / 1_000}K`
  }
  return `$${amount}`
}

export default function Home() {
  const [selectedAmount, setSelectedAmount] = useState<number>(25)
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('USD')
  const [dogs, setDogs] = useState<Dog[]>([])
  const [stats, setStats] = useState({ dogsRescued: 0, activeSponsors: 0, totalRaised: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchDogs(), fetchDogStats()])
      .then(([dogsData, statsData]) => {
        setDogs(dogsData)
        setStats(statsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const unsponsoredDogs = dogs.filter((d) => !d.is_sponsored)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-4 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-6 mb-6">
        <h1 className="text-xl font-black tracking-tight">
          <span className="text-white">bali</span>
          <span className="text-electric">paws</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="w-10 h-10 flex items-center justify-center bg-charcoal rounded-xl"
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            aria-label="Profile"
            className="w-10 h-10 flex items-center justify-center bg-charcoal rounded-xl"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Card */}
      <Link to="/dogs" className="block mx-6 mb-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-electric to-[#FFE566] p-[32px_28px]">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

          <span className="block text-[11px] font-bold uppercase tracking-widest text-black/80 mb-3">
            BALI PAWS RESCUE
          </span>

          <h2 className="text-[28px] font-black leading-tight tracking-tight text-black mb-2">
            Rescue a life.
            <br />
            Sponsor a dog.
          </h2>

          <p className="text-sm text-black/85 mb-6 max-w-[260px]">
            {unsponsoredDogs.length} dogs are waiting for a monthly sponsor. Will you be the one?
          </p>

          <span className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-[14px] font-bold text-sm">
            Meet the dogs
            <span className="inline-flex items-center justify-center w-6 h-6 bg-electric rounded-md text-black text-xs">
              &rarr;
            </span>
          </span>
        </div>
      </Link>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 px-6 mb-8">
        <StatPill number={String(stats.dogsRescued)} label="RESCUED" color="green" />
        <StatPill number={String(stats.activeSponsors)} label="SPONSORS" color="orange" />
        <StatPill
          number={stats.totalRaised > 0 ? `$${Math.round(stats.totalRaised / 1000)}K` : '$0'}
          label="RAISED"
          color="yellow"
        />
      </div>

      {/* Dogs Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between px-6 mb-4">
          <h3 className="text-lg font-extrabold text-white">Needs a sponsor</h3>
          <Link
            to="/dogs"
            className="text-electric text-xs font-bold uppercase tracking-widest"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="flex gap-3.5 overflow-x-auto px-6">
          {unsponsoredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      </section>

      {/* Quick Donate */}
      <section className="mx-6">
        <div className="bg-dark border border-charcoal rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-extrabold text-base">Quick donate</h3>
            <CurrencyToggle value={currency} onChange={(c) => {
              setCurrency(c)
              setSelectedAmount(c === 'USD' ? 25 : 400_000)
            }} />
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {(currency === 'USD' ? AMOUNTS_USD : AMOUNTS_IDR).map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`rounded-xl py-3.5 font-extrabold text-sm transition-colors ${
                  selectedAmount === amount
                    ? 'border-2 border-electric bg-electric/10 text-white'
                    : 'bg-charcoal text-white border-2 border-transparent'
                }`}
              >
                {formatAmount(amount, currency)}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/donate')}
            className="w-full bg-lime text-black rounded-[14px] py-4 font-extrabold text-sm"
          >
            Donate {formatAmount(selectedAmount, currency)} now
          </button>
        </div>
      </section>
    </div>
  )
}
