ALTER TABLE public.claim_moves 
ADD COLUMN reason_category text DEFAULT NULL,
ADD COLUMN reason_text text DEFAULT NULL,
ADD COLUMN days_delta integer DEFAULT 0;