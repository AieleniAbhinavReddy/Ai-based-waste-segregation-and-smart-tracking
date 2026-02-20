-- =====================================================
-- ADMIN & SUPERVISOR FEATURES EXTENSION
-- Smart Waste Management System
-- =====================================================
-- This file extends the existing schema without modifying existing tables

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'worker', 'supervisor', 'admin')) DEFAULT 'citizen',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ZONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    ward_number TEXT,
    city TEXT NOT NULL,
    region TEXT,
    area_sqkm DECIMAL(10,2),
    population INTEGER,
    supervisor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    worker_code TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    joining_date DATE,
    shift TEXT CHECK (shift IN ('morning', 'afternoon', 'evening', 'night')),
    vehicle_type TEXT,
    vehicle_number TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    gps_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPERVISORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.supervisors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    supervisor_code TEXT UNIQUE,
    phone TEXT,
    department TEXT,
    joining_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PICKUP LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pickup_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL NOT NULL,
    worker_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    citizen_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    location JSONB,
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    waste_weight DECIMAL(5,2),
    waste_types TEXT[] DEFAULT '{}',
    qr_code TEXT,
    qr_verified BOOLEAN DEFAULT FALSE,
    qr_verified_at TIMESTAMP WITH TIME ZONE,
    photo_proof_url TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VIOLATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.violations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    violation_type TEXT NOT NULL CHECK (violation_type IN (
        'gps_mismatch',
        'qr_fraud',
        'missing_proof',
        'weight_mismatch',
        'wrong_waste_type',
        'late_pickup',
        'repeat_violation'
    )),
    pickup_log_id UUID REFERENCES public.pickup_logs(id) ON DELETE SET NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    penalty_epoints INTEGER DEFAULT 0,
    description TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPLAINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL NOT NULL,
    filed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_to_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'worker_behavior',
        'missed_pickup',
        'improper_disposal',
        'vehicle_issue',
        'contamination',
        'other'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution_details TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKER PERFORMANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.worker_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    total_pickups INTEGER DEFAULT 0,
    completed_pickups INTEGER DEFAULT 0,
    failed_pickups INTEGER DEFAULT 0,
    missed_pickups INTEGER DEFAULT 0,
    qr_success_rate DECIMAL(5,2) DEFAULT 0,
    gps_violation_count INTEGER DEFAULT 0,
    average_pickup_time DECIMAL(5,2),
    efficiency_score DECIMAL(5,2) DEFAULT 0,
    compliance_score DECIMAL(5,2) DEFAULT 0,
    active_violations INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ZONE PERFORMANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.zone_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE UNIQUE,
    total_citizens INTEGER DEFAULT 0,
    total_workers INTEGER DEFAULT 0,
    total_pickups INTEGER DEFAULT 0,
    completed_pickups INTEGER DEFAULT 0,
    compliance_percentage DECIMAL(5,2) DEFAULT 0,
    waste_collected_kg DECIMAL(10,2) DEFAULT 0,
    average_response_time DECIMAL(5,2),
    zone_rating DECIMAL(3,2) DEFAULT 0,
    violations_this_month INTEGER DEFAULT 0,
    active_complaints INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CITIZEN COMPLIANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.citizen_compliance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    citizen_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    compliance_score DECIMAL(5,2) DEFAULT 100,
    total_waste_generated_kg DECIMAL(10,2) DEFAULT 0,
    correct_segregation_count INTEGER DEFAULT 0,
    incorrect_segregation_count INTEGER DEFAULT 0,
    total_violations INTEGER DEFAULT 0,
    active_violations INTEGER DEFAULT 0,
    penalty_epoints_deducted INTEGER DEFAULT 0,
    last_pickup_date DATE,
    compliance_rank TEXT DEFAULT 'good' CHECK (compliance_rank IN ('excellent', 'good', 'fair', 'poor')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKER LIVE LOCATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.worker_live_location (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    worker_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    accuracy DECIMAL(5,2),
    speed DECIMAL(5,2),
    heading DECIMAL(6,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    category TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENT TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    citizen_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    month TEXT,
    year INTEGER,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'overdue')),
    payment_method TEXT,
    transaction_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_live_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admin access: Can see everything
CREATE POLICY "admin_all_access" ON public.zones
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active'
        )
    );

-- Supervisor: Can see only their zone
CREATE POLICY "supervisor_zone_access" ON public.zones
    FOR SELECT USING (
        supervisor_id = auth.uid() OR 
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- Workers: Can see their own zone
CREATE POLICY "worker_self_access" ON public.workers
    FOR SELECT USING (
        user_id = auth.uid() OR 
        supervisor_id = auth.uid() OR
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- Workers: Can update own location
CREATE POLICY "worker_location_update" ON public.worker_live_location
    FOR ALL USING (
        worker_id = auth.uid() OR 
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active') OR
        auth.uid() IN (SELECT supervisor_id FROM public.workers WHERE user_id = auth.uid())
    );

-- Citizens: Can see own compliance
CREATE POLICY "citizen_compliance_self" ON public.citizen_compliance
    FOR SELECT USING (
        citizen_id = auth.uid() OR 
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- Citizens: Can file complaints
CREATE POLICY "citizen_file_complaints" ON public.complaints
    FOR INSERT WITH CHECK (
        filed_by_id = auth.uid() AND
        auth.uid() IN (SELECT user_id FROM public.user_profiles)
    );

-- Citizens: Can view own complaints
CREATE POLICY "citizen_view_complaints" ON public.complaints
    FOR SELECT USING (
        filed_by_id = auth.uid() OR 
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- Supervisors: Can view zone complaints
CREATE POLICY "supervisor_view_complaints" ON public.complaints
    FOR SELECT USING (
        zone_id IN (SELECT id FROM public.zones WHERE supervisor_id = auth.uid()) OR
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- Pickup logs: Anyone in zone can view
CREATE POLICY "pickup_logs_zone_access" ON public.pickup_logs
    FOR SELECT USING (
        zone_id IN (SELECT id FROM public.zones WHERE supervisor_id = auth.uid()) OR
        worker_id = auth.uid() OR
        citizen_id = auth.uid() OR
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin' AND status = 'active')
    );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_zones_supervisor_id ON public.zones(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_workers_zone_id ON public.workers(zone_id);
CREATE INDEX IF NOT EXISTS idx_workers_supervisor_id ON public.workers(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_pickup_logs_zone_id ON public.pickup_logs(zone_id);
CREATE INDEX IF NOT EXISTS idx_pickup_logs_worker_id ON public.pickup_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_pickup_logs_created_at ON public.pickup_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_violations_zone_id ON public.violations(zone_id);
CREATE INDEX IF NOT EXISTS idx_violations_user_id ON public.violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_created_at ON public.violations(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_zone_id ON public.complaints(zone_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_citizen_compliance_zone_id ON public.citizen_compliance(zone_id);

-- =====================================================
-- SYSTEM SETTINGS INITIALIZATION
-- =====================================================
INSERT INTO public.system_settings (setting_key, category, setting_value, description)
VALUES
    ('gps_tolerance_meters', 'system', '{"value": 100}'::jsonb, 'GPS tolerance distance in meters'),
    ('pickup_time_window_hours', 'system', '{"start": 6, "end": 20}'::jsonb, 'Allowed pickup time window'),
    ('qr_fraud_threshold', 'system', '{"count": 3, "days": 30}'::jsonb, 'Number of QR violations before flagging'),
    ('compliance_scoring_rules', 'scoring', '{"correct": 10, "incorrect": -5, "violation": -20}'::jsonb, 'Points for compliance calculation'),
    ('epoint_calculation', 'scoring', '{"per_kg_waste": 1, "segregation_bonus": 50}'::jsonb, 'E-points calculation rules'),
    ('violation_penalty_rules', 'penalties', '{"gps_mismatch": 10, "qr_fraud": 50, "incomplete": 5}'::jsonb, 'Penalty e-points for violations')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = user_uuid AND status = 'active'
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'citizen');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid AND role = 'admin' AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is supervisor
CREATE OR REPLACE FUNCTION public.is_supervisor(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid AND role = 'supervisor' AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update worker performance
CREATE OR REPLACE FUNCTION public.update_worker_performance(worker_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.worker_performance (worker_id, completed_pickups, total_pickups)
    SELECT 
        worker_uuid,
        COUNT(CASE WHEN status = 'completed' THEN 1 END),
        COUNT(*)
    FROM public.pickup_logs
    WHERE worker_id = worker_uuid AND created_at >= NOW() - INTERVAL '30 days'
    ON CONFLICT (worker_id) DO UPDATE SET
        completed_pickups = EXCLUDED.completed_pickups,
        total_pickups = EXCLUDED.total_pickups,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update zone performance
CREATE OR REPLACE FUNCTION public.update_zone_performance(zone_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.zone_performance (zone_id, total_pickups, completed_pickups)
    SELECT 
        zone_uuid,
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
    FROM public.pickup_logs
    WHERE zone_id = zone_uuid AND created_at >= NOW() - INTERVAL '30 days'
    ON CONFLICT (zone_id) DO UPDATE SET
        total_pickups = EXCLUDED.total_pickups,
        completed_pickups = EXCLUDED.completed_pickups,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate citizen compliance score
CREATE OR REPLACE FUNCTION public.calculate_citizen_compliance(citizen_uuid UUID)
RETURNS VOID AS $$
DECLARE
    correct_count INTEGER;
    incorrect_count INTEGER;
    violation_count INTEGER;
    new_score DECIMAL(5,2);
BEGIN
    -- Get classification counts
    SELECT 
        COUNT(CASE WHEN verified = true THEN 1 END),
        COUNT(CASE WHEN verified = false THEN 1 END)
    INTO correct_count, incorrect_count
    FROM public.waste_classifications
    WHERE user_id = citizen_uuid AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Get violation count
    SELECT COUNT(*) INTO violation_count
    FROM public.violations
    WHERE user_id = citizen_uuid AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate score (100 base - penalties)
    new_score := 100 - (incorrect_count * 5) - (violation_count * 10);
    new_score := GREATEST(0, LEAST(100, new_score));
    
    INSERT INTO public.citizen_compliance (citizen_id, compliance_score)
    VALUES (citizen_uuid, new_score)
    ON CONFLICT (citizen_id) DO UPDATE SET
        compliance_score = new_score,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
