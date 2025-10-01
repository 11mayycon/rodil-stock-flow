-- Corrigir políticas RLS para shift_closures e receipts_log
-- O sistema usa autenticação customizada, não Supabase Auth

-- Remover políticas antigas que usam auth.uid()
DROP POLICY IF EXISTS "Users can create their own shift closures" ON public.shift_closures;
DROP POLICY IF EXISTS "Users can view their own shift closures" ON public.shift_closures;
DROP POLICY IF EXISTS "Admins can view all shift closures" ON public.shift_closures;

-- Criar política permissiva para INSERT em shift_closures
CREATE POLICY "Authenticated users can create shift closures"
ON public.shift_closures
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar política permissiva para SELECT em shift_closures
CREATE POLICY "Authenticated users can view shift closures"
ON public.shift_closures
FOR SELECT
TO authenticated
USING (true);

-- Remover políticas antigas de receipts_log
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts_log;
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts_log;
DROP POLICY IF EXISTS "Admins can view all receipts" ON public.receipts_log;

-- Criar políticas permissivas para receipts_log
CREATE POLICY "Authenticated users can create receipts"
ON public.receipts_log
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view receipts"
ON public.receipts_log
FOR SELECT
TO authenticated
USING (true);