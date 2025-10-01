-- Policy: permitir deletar apenas registros já confirmados
CREATE POLICY "Delete confirmed waste records"
ON public.waste_records
FOR DELETE
TO public
USING (confirmed IS TRUE);