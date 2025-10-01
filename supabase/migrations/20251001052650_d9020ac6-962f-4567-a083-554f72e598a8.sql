-- Atualizar políticas RLS para shift_closures
-- Permitir que qualquer usuário autenticado crie fechamentos de turno
DROP POLICY IF EXISTS "Admins can create shift closures" ON public.shift_closures;

CREATE POLICY "Users can create their own shift closures"
ON public.shift_closures
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Atualizar política de visualização para permitir que usuários vejam apenas seus próprios fechamentos
DROP POLICY IF EXISTS "Users can view shift closures" ON public.shift_closures;

CREATE POLICY "Users can view their own shift closures"
ON public.shift_closures
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Adicionar política para admins verem todos os fechamentos
CREATE POLICY "Admins can view all shift closures"
ON public.shift_closures
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Atualizar políticas RLS para receipts_log
-- Permitir que usuários criem seus próprios logs de recibos
DROP POLICY IF EXISTS "Users can create receipts" ON public.receipts_log;

CREATE POLICY "Users can create their own receipts"
ON public.receipts_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Atualizar política de visualização
DROP POLICY IF EXISTS "Users can view receipts" ON public.receipts_log;

CREATE POLICY "Users can view their own receipts"
ON public.receipts_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Adicionar política para admins verem todos os recibos
CREATE POLICY "Admins can view all receipts"
ON public.receipts_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);