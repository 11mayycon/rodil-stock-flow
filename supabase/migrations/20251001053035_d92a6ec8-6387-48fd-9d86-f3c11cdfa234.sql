-- Align RLS with app's custom auth (requests run as anon role)
-- Allow public (anon) role to INSERT/SELECT where appropriate

-- shift_closures
DROP POLICY IF EXISTS "Authenticated users can create shift closures" ON public.shift_closures;
DROP POLICY IF EXISTS "Authenticated users can view shift closures" ON public.shift_closures;

CREATE POLICY "Public can insert shift closures"
ON public.shift_closures
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can select shift closures"
ON public.shift_closures
FOR SELECT
TO public
USING (true);

-- receipts_log
DROP POLICY IF EXISTS "Authenticated users can create receipts" ON public.receipts_log;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON public.receipts_log;

CREATE POLICY "Public can insert receipts"
ON public.receipts_log
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can select receipts"
ON public.receipts_log
FOR SELECT
TO public
USING (true);