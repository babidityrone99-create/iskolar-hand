-- Create enum for errand status
CREATE TYPE errand_status AS ENUM ('available', 'in_progress', 'completed', 'cancelled');

-- Drop the default temporarily
ALTER TABLE public.errands 
ALTER COLUMN status DROP DEFAULT;

-- Alter errands table to use the enum
ALTER TABLE public.errands 
ALTER COLUMN status TYPE errand_status USING status::errand_status;

-- Set the default back
ALTER TABLE public.errands 
ALTER COLUMN status SET DEFAULT 'available'::errand_status;

-- Add accepted_by column to track who accepted the errand
ALTER TABLE public.errands 
ADD COLUMN accepted_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Update RLS policy to allow helpers to update status
CREATE POLICY "Helpers can update errand status" 
ON public.errands 
FOR UPDATE 
USING (auth.uid() = accepted_by OR auth.uid() = user_id);