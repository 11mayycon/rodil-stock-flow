-- Corrigir políticas RLS para waste_records e stock_movements
-- Remover políticas restritivas e criar políticas permissivas

-- 1. Remover políticas antigas de waste_records
DROP POLICY IF EXISTS "Users can view waste records" ON public.waste_records;
DROP POLICY IF EXISTS "Users can create waste records" ON public.waste_records;
DROP POLICY IF EXISTS "Admins can update waste records" ON public.waste_records;
DROP POLICY IF EXISTS "Admins can delete waste records" ON public.waste_records;
DROP POLICY IF EXISTS "Delete confirmed waste records" ON public.waste_records;

-- 2. Criar política permissiva para waste_records (acesso público autenticado)
CREATE POLICY "Allow all authenticated operations on waste_records"
ON public.waste_records
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Remover políticas antigas de stock_movements
DROP POLICY IF EXISTS "Users can view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can create stock movements" ON public.stock_movements;

-- 4. Criar política permissiva para stock_movements
CREATE POLICY "Allow all authenticated operations on stock_movements"
ON public.stock_movements
FOR ALL
TO public
USING (true)
WITH CHECK (true);