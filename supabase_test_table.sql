-- Create Test table with dummy columns
CREATE TABLE IF NOT EXISTS public.test (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Text columns
    name TEXT,
    description TEXT,
    email VARCHAR(255),
    
    -- Numeric columns
    age INTEGER,
    score DECIMAL(5,2),
    rating FLOAT,
    
    -- Boolean column
    is_active BOOLEAN DEFAULT true,
    
    -- Date/time columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    birth_date DATE,
    
    -- JSON column
    metadata JSONB,
    
    -- Array columns
    tags TEXT[],
    scores INTEGER[],
    
    -- Status column with constraint
    status TEXT CHECK (status IN ('pending', 'active', 'inactive', 'completed')) DEFAULT 'pending',
    
    -- Additional dummy columns
    phone VARCHAR(20),
    website TEXT,
    avatar_url TEXT,
    notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_name ON public.test(name);
CREATE INDEX IF NOT EXISTS idx_test_status ON public.test(status);
CREATE INDEX IF NOT EXISTS idx_test_created_at ON public.test(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_updated_at 
    BEFORE UPDATE ON public.test 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access to test table" ON public.test
    FOR SELECT USING (true);

CREATE POLICY "Public insert access to test table" ON public.test
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to test table" ON public.test
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access to test table" ON public.test
    FOR DELETE USING (true);

-- Insert sample data
INSERT INTO public.test (
    name, description, email, age, score, rating, is_active, 
    birth_date, metadata, tags, scores, status, phone, website, avatar_url, notes
) VALUES 
(
    'John Doe',
    'Test user for demonstration',
    'john.doe@example.com',
    25,
    85.50,
    4.2,
    true,
    '1998-05-15',
    '{"department": "engineering", "skills": ["javascript", "react"]}',
    ARRAY['developer', 'senior'],
    ARRAY[90, 85, 92],
    'active',
    '+1234567890',
    'https://johndoe.dev',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'Sample test record'
),
(
    'Jane Smith',
    'Another test user',
    'jane.smith@example.com',
    30,
    92.75,
    4.8,
    true,
    '1993-08-22',
    '{"department": "design", "skills": ["ui", "ux"]}',
    ARRAY['designer', 'lead'],
    ARRAY[95, 88, 94],
    'active',
    '+1987654321',
    'https://janesmith.design',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    'Another sample record'
),
(
    'Bob Wilson',
    'Test user with inactive status',
    'bob.wilson@example.com',
    45,
    78.25,
    3.5,
    false,
    '1978-12-03',
    '{"department": "marketing", "skills": ["strategy"]}',
    ARRAY['marketing', 'manager'],
    ARRAY[82, 75, 80],
    'inactive',
    '+1122334455',
    'https://bobwilson.marketing',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Inactive test record'
);

-- Verify creation
SELECT 'Test table created successfully!' as status, COUNT(*) as total_records FROM public.test;




