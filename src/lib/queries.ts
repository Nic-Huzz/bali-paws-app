import { supabase } from './supabase'
import type { Dog, DogUpdate } from '../types'

// ── Dogs ──

export async function fetchDogs(): Promise<Dog[]> {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Dog[]
}

export async function fetchDog(id: string): Promise<Dog | null> {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }
  return data as Dog
}

export async function fetchDogUpdates(dogId: string): Promise<DogUpdate[]> {
  const { data, error } = await supabase
    .from('dog_updates')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DogUpdate[]
}

export async function fetchDogStats() {
  const { count: dogCount } = await supabase
    .from('dogs')
    .select('*', { count: 'exact', head: true })

  const { count: sponsorCount } = await supabase
    .from('dogs')
    .select('*', { count: 'exact', head: true })
    .eq('is_sponsored', true)

  const { data: donations } = await supabase
    .from('donations')
    .select('amount, currency')
    .eq('payment_status', 'completed')

  const totalRaised = donations?.reduce((sum, d) => {
    return sum + (d.currency === 'USD' ? Number(d.amount) : Number(d.amount) / 16000)
  }, 0) ?? 0

  return {
    dogsRescued: dogCount ?? 0,
    activeSponsors: sponsorCount ?? 0,
    totalRaised: Math.round(totalRaised),
  }
}

// ── User data ──

export async function fetchUserDonations(userId: string) {
  const { data, error } = await supabase
    .from('donations')
    .select('*, dogs(name)')
    .eq('donor_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchUserSponsoredDogs(userId: string): Promise<Dog[]> {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('sponsor_id', userId)

  if (error) throw error
  return data as Dog[]
}

// ── Admin: Dogs CRUD ──

export async function createDog(dog: {
  name: string
  photo_url: string
  story: string
  monthly_amount_usd: number
  monthly_amount_idr: number
}) {
  const { data, error } = await supabase
    .from('dogs')
    .insert(dog)
    .select()
    .single()

  if (error) throw error
  return data as Dog
}

export async function updateDog(id: string, updates: Partial<Dog>) {
  const { data, error } = await supabase
    .from('dogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Dog
}

export async function deleteDog(id: string) {
  const { error } = await supabase
    .from('dogs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Admin: Dog Updates ──

export async function createDogUpdate(update: {
  dog_id: string
  caption: string
  photo_url?: string
  posted_by: string
}) {
  const { data, error } = await supabase
    .from('dog_updates')
    .insert(update)
    .select()
    .single()

  if (error) throw error
  return data as DogUpdate
}
