-- Corrigir políticas RLS da tabela users
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Criar políticas permissivas para users
CREATE POLICY "Allow all operations on users"
ON public.users
FOR ALL
TO public
USING (true)
WITH CHECK (true);