export interface Dog {
  id: string
  name: string
  photo_url: string | null
  story: string | null
  monthly_amount_usd: number
  monthly_amount_idr: number
  is_sponsored: boolean
  sponsor_id: string | null
  created_at: string
}

export interface DogUpdate {
  id: string
  dog_id: string
  photo_url: string | null
  caption: string
  posted_by: string
  created_at: string
}

export interface Donation {
  id: string
  amount: number
  currency: 'USD' | 'IDR'
  type: 'one-time' | 'monthly'
  donor_id: string
  dog_id: string | null
  payment_status: string
  stripe_payment_id: string
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  country: string
  currency_preference: 'USD' | 'IDR'
  is_monthly_sponsor: boolean
  total_donated: number
  stripe_customer_id: string | null
  role: 'donor' | 'admin'
  created_at: string
}
