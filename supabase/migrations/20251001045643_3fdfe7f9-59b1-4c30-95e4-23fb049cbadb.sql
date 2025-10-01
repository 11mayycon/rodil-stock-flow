-- Criar policy para permitir que admins excluam registros de desperdício
CREATE POLICY "Admins can delete waste records"
ON public.waste_records
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);