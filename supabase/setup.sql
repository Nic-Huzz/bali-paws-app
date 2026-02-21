-- ============================================
-- Bali Paws Rescue — Database Setup
-- Paste this entire file into Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query > Paste > Run)
-- ============================================

-- 1. USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  country text default '',
  currency_preference text default 'USD' check (currency_preference in ('USD', 'IDR')),
  is_monthly_sponsor boolean default false,
  total_donated numeric default 0,
  stripe_customer_id text,
  role text default 'donor' check (role in ('donor', 'admin')),
  created_at timestamptz default now()
);

-- 2. DOGS
create table public.dogs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  photo_url text,
  story text,
  monthly_amount_usd numeric default 25,
  monthly_amount_idr numeric default 400000,
  is_sponsored boolean default false,
  sponsor_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 3. DONATIONS
create table public.donations (
  id uuid default gen_random_uuid() primary key,
  amount numeric not null,
  currency text not null check (currency in ('USD', 'IDR')),
  type text not null check (type in ('one-time', 'monthly')),
  donor_id uuid references public.profiles(id),
  dog_id uuid references public.dogs(id),
  payment_status text default 'pending',
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- 4. DOG UPDATES (shelter staff posts)
create table public.dog_updates (
  id uuid default gen_random_uuid() primary key,
  dog_id uuid references public.dogs(id) on delete cascade not null,
  photo_url text,
  caption text not null,
  posted_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.donations enable row level security;
alter table public.dog_updates enable row level security;

-- Profiles: users can read their own, admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Dogs: everyone can read, admins can insert/update
create policy "Anyone can view dogs"
  on public.dogs for select
  to anon, authenticated
  using (true);

create policy "Admins can manage dogs"
  on public.dogs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Donations: users see their own, admins see all
create policy "Users can view own donations"
  on public.donations for select
  using (auth.uid() = donor_id);

create policy "Admins can view all donations"
  on public.donations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Authenticated users can create donations"
  on public.donations for insert
  to authenticated
  with check (auth.uid() = donor_id);

-- Dog Updates: everyone can read, admins can create
create policy "Anyone can view dog updates"
  on public.dog_updates for select
  to anon, authenticated
  using (true);

create policy "Admins can create dog updates"
  on public.dog_updates for insert
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- SEED DATA: 6 rescue dogs
-- ============================================

insert into public.dogs (name, photo_url, story, monthly_amount_usd, monthly_amount_idr, is_sponsored) values
  ('Kopi', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', 'Kopi was hit by a motorbike on a busy Ubud road. A local warung owner wrapped him in a sarong and brought him to Bali Paws. His hind leg was badly injured, but after weeks of care and rehab he made a full recovery. Now he greets every visitor at the shelter gate with a wagging tail.', 25, 400000, false),
  ('Dewi', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop', 'Dewi was pulled from a flooded drainage ditch in Denpasar during monsoon season. She was barely eight weeks old, shivering and covered in mud. The rescue team nursed her through pneumonia. Today she is the most playful dog at the shelter — she loves belly rubs and chasing geckos across the yard.', 25, 400000, false),
  ('Bagus', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=400&fit=crop', 'Bagus was found chained to a crumbling wall behind an abandoned warung near Canggu. He had deep scars around his neck from a too-tight rope. Despite everything, he has the gentlest temperament — he leans against your leg and sighs happily when you scratch behind his ears.', 25, 400000, true),
  ('Lila', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop', 'Lila was the runt of a litter born under a temple offering table in Sanur. The temple priest called Bali Paws when her siblings were adopted by locals but no one wanted the smallest pup. She has grown into a confident, curious dog who loves exploring every corner of the shelter grounds.', 25, 400000, false),
  ('Wayan', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&h=400&fit=crop', 'Wayan is a Seminyak beach dog who wandered into the shelter compound on his own one morning and simply never left. No one knows his full story, but the scars on his muzzle suggest he survived dog fights. He is calm, dignified, and fiercely loyal to anyone who shows him kindness.', 25, 400000, false),
  ('Nasi', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=400&fit=crop', 'Nasi was found starving in the rice paddies near Tegallalang with a swollen belly — she was pregnant. She gave birth to five healthy puppies at the shelter two weeks later. All five pups have been adopted, but Nasi still waits patiently for her own forever family.', 25, 400000, false);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
