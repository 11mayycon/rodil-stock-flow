-- Tornar o bucket desperdicios público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'desperdicios';

-- Remover políticas antigas de storage para o bucket desperdicios
DROP POLICY IF EXISTS "Authenticated users can upload waste images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view waste images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete waste images" ON storage.objects;

-- Criar políticas permissivas para o bucket desperdicios
CREATE POLICY "Allow all operations on desperdicios bucket"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'desperdicios')
WITH CHECK (bucket_id = 'desperdicios');