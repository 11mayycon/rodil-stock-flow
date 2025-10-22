-- Adicionar campo para armazenar subcategoria de pagamento
ALTER TABLE public.sales
ADD COLUMN payment_submethod text;