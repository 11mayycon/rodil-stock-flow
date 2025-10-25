-- Create table for inventory counts
CREATE TABLE public.contagens_inventario (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  codigo_barras TEXT,
  nome TEXT,
  descricao TEXT,
  quantidade_estoque INTEGER,
  quantidade_contada INTEGER NOT NULL,
  usuario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT contagens_inventario_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.contagens_inventario ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Anyone authenticated can view inventory counts"
ON public.contagens_inventario
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can create inventory counts"
ON public.contagens_inventario
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_contagens_product_id ON public.contagens_inventario(product_id);
CREATE INDEX idx_contagens_created_at ON public.contagens_inventario(created_at DESC);