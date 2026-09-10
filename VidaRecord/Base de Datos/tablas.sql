-- =============================================
-- VIDARECORD — Estructura completa de base de datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Extender tabla de usuarios (auth.users ya existe en Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  paypal_subscription_id TEXT,
  active_profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Perfiles médicos
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  avatar_url TEXT,
  is_owner BOOLEAN DEFAULT FALSE,
  relationship TEXT DEFAULT 'yo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Médicos
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  clinic_name TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Citas y consultas
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME,
  specialty TEXT,
  clinic_name TEXT,
  reason TEXT,
  diagnosis TEXT,
  notes TEXT,
  next_appointment_date DATE,
  status TEXT DEFAULT 'completada' CHECK (status IN ('programada', 'completada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Medicamentos
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  quantity_initial INTEGER,
  quantity_remaining INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Estudios y documentos
CREATE TABLE public.studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('laboratorio', 'imagen', 'receta', 'otro')),
  date DATE,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'image')),
  ai_summary TEXT,
  ai_processed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indicadores de salud
CREATE TABLE public.health_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('presion', 'glucosa', 'peso', 'temperatura', 'frecuencia_cardiaca', 'colesterol', 'otro')),
  value_primary DECIMAL,
  value_secondary DECIMAL,
  unit TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Diagnósticos
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  diagnosed_at DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_chronic BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Suscripciones y pagos
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paypal_order_id TEXT,
  paypal_subscription_id TEXT,
  plan TEXT NOT NULL,
  amount DECIMAL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Interacciones con IA
CREATE TABLE public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  study_id UUID REFERENCES public.studies(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('analisis_documento', 'pregunta', 'resumen')),
  input_summary TEXT,
  output TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FOREIGN KEY pendiente (referencia circular resuelta aquí)
-- =============================================
ALTER TABLE public.users
  ADD CONSTRAINT fk_active_profile
  FOREIGN KEY (active_profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- =============================================
-- ROW LEVEL SECURITY — Cada usuario solo ve sus datos
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "users_own" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "doctors_own" ON public.doctors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "appointments_own" ON public.appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "medications_own" ON public.medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "studies_own" ON public.studies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "health_indicators_own" ON public.health_indicators FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "diagnoses_own" ON public.diagnoses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_interactions_own" ON public.ai_interactions FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCIÓN: crear usuario automáticamente al registrarse
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.profiles (user_id, full_name, is_owner, relationship)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    TRUE,
    'yo'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara la función al crear un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE: bucket para documentos médicos
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false);

CREATE POLICY "users_own_documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
