import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import DogForm from '../../components/admin/DogForm'
import { createDog } from '../../lib/queries'

export default function AdminDogNew() {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(data: {
    name: string
    photo_url: string
    story: string
    monthly_amount_usd: number
    monthly_amount_idr: number
  }) {
    setSubmitting(true)
    try {
      await createDog(data)
      navigate('/admin')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link to="/admin" className="text-xs text-gray font-bold hover:text-white transition-colors">
          &larr; Back to dogs
        </Link>
        <h2 className="text-xl font-black text-white mt-2">Add Dog</h2>
      </div>

      <DogForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Add Dog"
      />
    </AdminLayout>
  )
}
