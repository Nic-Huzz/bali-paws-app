import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserDonations, fetchUserSponsoredDogs } from '../lib/queries'
import type { Dog } from '../types'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [sponsoredDogs, setSponsoredDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }
    Promise.all([
      fetchUserDonations(profile.id),
      fetchUserSponsoredDogs(profile.id),
    ])
      .then(([donationsData, dogsData]) => {
        setDonations(donationsData)
        setSponsoredDogs(dogsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [profile])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (profile.email?.[0] ?? '?').toUpperCase()

  const totalDonated = donations.reduce((sum, d) => {
    if (d.currency === 'USD') return sum + Number(d.amount)
    return sum + Number(d.amount) / 16000
  }, 0)

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="pt-5 pb-2">
        <h1 className="text-center text-lg font-extrabold">My Account</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-dark rounded-2xl p-6 mx-6 mt-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric to-lime flex items-center justify-center">
          <span className="text-black font-black text-xl">{initials}</span>
        </div>
        <h2 className="text-xl font-extrabold mt-3">{profile.name || profile.email}</h2>
        <p className="text-xs text-gray">
          Member since {formatDate(profile.created_at)}
        </p>

        <div className="flex gap-4 mt-4">
          <div className="bg-charcoal rounded-xl px-4 py-3">
            <span className="block font-bold text-white">
              ${Math.round(totalDonated)}
            </span>
            <span className="text-xs text-gray">donated</span>
          </div>
          <div className="bg-charcoal rounded-xl px-4 py-3">
            <span className="block font-bold text-white">{sponsoredDogs.length}</span>
            <span className="text-xs text-gray">dog{sponsoredDogs.length !== 1 ? 's' : ''} sponsored</span>
          </div>
        </div>
      </div>

      {/* My Sponsored Dogs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-electric border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <section className="mt-8 px-6">
            <h3 className="font-extrabold mb-4">My Sponsored Dogs</h3>

            {sponsoredDogs.length === 0 ? (
              <div className="bg-dark rounded-2xl p-6 text-center">
                <p className="text-gray text-sm">You haven't sponsored any dogs yet.</p>
                <Link to="/dogs" className="text-electric text-sm font-bold mt-2 inline-block">
                  Browse dogs
                </Link>
              </div>
            ) : (
              sponsoredDogs.map((dog) => (
                <div key={dog.id} className="bg-dark rounded-2xl overflow-hidden mb-3">
                  <div className="h-32 bg-gradient-to-br from-charcoal via-dark to-charcoal overflow-hidden">
                    {dog.photo_url && (
                      <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white">{dog.name}</h4>
                      <span className="text-electric font-bold">${dog.monthly_amount_usd}/mo</span>
                    </div>
                    <button
                      onClick={() => navigate(`/dogs/${dog.id}`)}
                      className="text-teal text-xs font-semibold mt-2"
                    >
                      View updates
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Donation History */}
          <section className="mt-8 px-6 mb-8">
            <h3 className="font-extrabold mb-4">Donation History</h3>

            {donations.length === 0 ? (
              <p className="text-gray text-sm">No donations yet.</p>
            ) : (
              <div>
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex justify-between items-center py-4 border-b border-charcoal last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {donation.dogs?.name
                          ? `${donation.dogs.name} — ${donation.type === 'monthly' ? 'Monthly' : 'One-time'}`
                          : 'One-time donation'}
                      </p>
                      <p className="text-xs text-gray">{formatDate(donation.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {donation.currency === 'IDR' ? 'Rp ' : '$'}
                        {Number(donation.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-teal capitalize">{donation.payment_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Settings */}
      <section className="mt-4 px-6 mb-8">
        <div className="bg-dark rounded-2xl">
          <div className="flex justify-between py-4 px-5 text-sm border-b border-charcoal">
            <span className="text-white">Currency Preference</span>
            <span className="text-gray">{profile.currency_preference}</span>
          </div>
          <div className="flex justify-between py-4 px-5 text-sm border-b border-charcoal">
            <span className="text-white">Email</span>
            <span className="text-gray">{profile.email}</span>
          </div>
          {profile.role === 'admin' && (
            <Link
              to="/admin"
              className="flex justify-between py-4 px-5 text-sm border-b border-charcoal"
            >
              <span className="text-electric font-bold">Admin Portal</span>
              <span className="text-electric">&rarr;</span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left py-4 px-5 text-sm"
          >
            <span className="text-red-400">Sign Out</span>
          </button>
        </div>
      </section>
    </div>
  )
}
