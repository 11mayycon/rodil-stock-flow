-- Migration to create a function for deleting a product and its dependencies

CREATE OR REPLACE FUNCTION delete_product_and_dependencies(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete related records in waste_records
    DELETE FROM waste_records WHERE product_id = p_product_id;

    -- Delete related records in stock_movements
    DELETE FROM stock_movements WHERE product_id = p_product_id;

    -- Delete related records in sale_items
    DELETE FROM sale_items WHERE product_id = p_product_id;

    -- Delete related records in receipt_items
    DELETE FROM receipt_items WHERE product_id = p_product_id;

    -- Finally, delete the product itself
    DELETE FROM products WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;