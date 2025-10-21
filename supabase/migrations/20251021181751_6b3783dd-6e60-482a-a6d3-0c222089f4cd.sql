-- Remover constraints existentes e recriar com ON DELETE SET NULL e ON UPDATE CASCADE

-- 1. Stock movements
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_user_id_fkey;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 2. Waste records
ALTER TABLE waste_records DROP CONSTRAINT IF EXISTS waste_records_user_id_fkey;
ALTER TABLE waste_records ADD CONSTRAINT waste_records_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

ALTER TABLE waste_records DROP CONSTRAINT IF EXISTS waste_records_confirmed_by_fkey;
ALTER TABLE waste_records ADD CONSTRAINT waste_records_confirmed_by_fkey 
    FOREIGN KEY (confirmed_by) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 3. Sales
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE sales ADD CONSTRAINT sales_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 4. Receipts
ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_created_by_fkey;
ALTER TABLE receipts ADD CONSTRAINT receipts_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 5. Audit logs
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;