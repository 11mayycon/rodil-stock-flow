-- Criar bucket para armazenar imagens de desperdício
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'desperdicios',
  'desperdicios',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Authenticated users can upload waste images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view waste images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete waste images" ON storage.objects;

-- Criar policy para permitir upload de imagens pelos usuários autenticados
CREATE POLICY "Authenticated users can upload waste images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'desperdicios');

-- Criar policy para permitir visualização das imagens pelos usuários autenticados
CREATE POLICY "Authenticated users can view waste images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'desperdicios');

-- Criar policy para permitir que admins deletem imagens
CREATE POLICY "Admins can delete waste images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'desperdicios' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);