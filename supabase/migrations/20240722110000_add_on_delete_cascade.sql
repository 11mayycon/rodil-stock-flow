-- Add ON DELETE CASCADE to foreign key constraints

-- Alter receipt_items table (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receipt_items') THEN
    ALTER TABLE receipt_items
    DROP CONSTRAINT IF EXISTS receipt_items_product_id_fkey,
    ADD CONSTRAINT receipt_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Alter sale_items table (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
    ALTER TABLE sale_items
    DROP CONSTRAINT IF EXISTS sale_items_product_id_fkey,
    ADD CONSTRAINT sale_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Alter stock_movements table (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
    ALTER TABLE stock_movements
    DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey,
    ADD CONSTRAINT stock_movements_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Alter waste_records table (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waste_records') THEN
    ALTER TABLE waste_records
    DROP CONSTRAINT IF EXISTS waste_records_product_id_fkey,
    ADD CONSTRAINT waste_records_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;