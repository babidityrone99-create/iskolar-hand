-- Add balance column to profiles table
ALTER TABLE public.profiles
ADD COLUMN balance NUMERIC DEFAULT 0 NOT NULL;

-- Create transactions table to track all earnings and spending
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'spending')),
  description TEXT NOT NULL,
  errand_id UUID REFERENCES errands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update user balance when transaction is added
CREATE OR REPLACE FUNCTION public.update_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'earning' THEN
    UPDATE profiles 
    SET balance = balance + NEW.amount 
    WHERE user_id = NEW.user_id;
  ELSIF NEW.type = 'spending' THEN
    UPDATE profiles 
    SET balance = balance - NEW.amount 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update balance
CREATE TRIGGER update_balance_after_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_balance_on_transaction();

-- Create index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);