-- Criar tabela para controlar turnos ativos
CREATE TABLE IF NOT EXISTS public.active_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.active_shifts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own active shifts"
  ON public.active_shifts
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own active shifts"
  ON public.active_shifts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own active shifts"
  ON public.active_shifts
  FOR DELETE
  USING (true);

-- Adicionar campos de data/hora de início e fim no shift_closures se ainda não existem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'shift_closures' 
                 AND column_name = 'shift_start_time') THEN
    ALTER TABLE public.shift_closures 
    ADD COLUMN shift_start_time TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'shift_closures' 
                 AND column_name = 'shift_end_time') THEN
    ALTER TABLE public.shift_closures 
    ADD COLUMN shift_end_time TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;