-- Corrigir função delete_product_and_dependencies para ter search_path seguro
CREATE OR REPLACE FUNCTION public.delete_product_and_dependencies(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Delete related records in waste_records
    DELETE FROM public.waste_records WHERE product_id = p_product_id;

    -- Delete related records in stock_movements
    DELETE FROM public.stock_movements WHERE product_id = p_product_id;

    -- Delete related records in sale_items
    DELETE FROM public.sale_items WHERE product_id = p_product_id;

    -- Delete related records in receipt_items
    DELETE FROM public.receipt_items WHERE product_id = p_product_id;

    -- Finally, delete the product itself
    DELETE FROM public.products WHERE id = p_product_id;
END;
$$;