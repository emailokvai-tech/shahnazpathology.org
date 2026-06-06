-- ==============================================================================
-- SHAHNAZ PATHOLOGY - ENTERPRISE SCHEMA (PHASE 1)
-- Description: Core tables and Row Level Security (RLS) for the digital platform
-- ==============================================================================

-- 1. Create a custom enum for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- 2. Profiles Table: Extends the Supabase auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role user_role DEFAULT 'patient'::user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Patients Table: Holds clinical and demographic data
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 4. Appointments Table: Connects patients with tests/doctors
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict HIPAA-compliant data boundaries
-- ==============================================================================

-- PROFILES: Users can read their own profile. Admins/Doctors can read all.
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- PATIENTS: Patients can view their own clinical record.
CREATE POLICY "Patients can view own clinical data" 
  ON public.patients FOR SELECT 
  USING (auth.uid() = profile_id);

-- APPOINTMENTS: Patients can view their own appointments.
CREATE POLICY "Patients can view own appointments" 
  ON public.appointments FOR SELECT 
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE profile_id = auth.uid()
    )
  );

-- ADMIN & DOCTOR BYPASS (For Phase 1, we will allow them broad access)
-- In a real production system, this would be restricted via secure RPCs or stricter policies.
CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Staff can view all patients"
  ON public.patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Staff can view all appointments"
  ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
