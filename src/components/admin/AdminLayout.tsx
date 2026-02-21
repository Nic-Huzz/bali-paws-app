import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

const tabs = [
  { label: 'Dogs', path: '/admin' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-black pb-8">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-charcoal">
        <h1 className="text-lg font-black tracking-tight">
          <span className="text-white">bali</span>
          <span className="text-electric">paws</span>
          <span className="text-gray text-xs font-bold uppercase tracking-widest ml-2">
            ADMIN
          </span>
        </h1>
        <Link to="/" className="text-xs text-gray font-bold hover:text-white transition-colors">
          Back to site
        </Link>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 px-6 py-3 border-b border-charcoal">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                active
                  ? 'bg-electric text-black'
                  : 'text-gray hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        {children}
      </div>
    </div>
  )
}
