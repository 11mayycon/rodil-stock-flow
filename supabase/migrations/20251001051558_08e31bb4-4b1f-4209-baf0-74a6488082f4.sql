-- Tabela para log de recibos/notas emitidas
CREATE TABLE IF NOT EXISTS public.receipts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  user_id UUID,
  receipt_number TEXT NOT NULL,
  printed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para fechamentos de turno
CREATE TABLE IF NOT EXISTS public.shift_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  average_ticket NUMERIC NOT NULL DEFAULT 0,
  payment_summary JSONB,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.receipts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_closures ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para receipts_log
CREATE POLICY "Users can view receipts"
ON public.receipts_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create receipts"
ON public.receipts_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas RLS para shift_closures
CREATE POLICY "Users can view shift closures"
ON public.shift_closures FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create shift closures"
ON public.shift_closures FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);