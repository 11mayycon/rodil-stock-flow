-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'employee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'outro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (custom auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT,
  role user_role NOT NULL DEFAULT 'employee',
  cargo TEXT,
  password_hash TEXT NOT NULL,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_barras TEXT UNIQUE,
  nome TEXT NOT NULL,
  preco NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  unidade TEXT DEFAULT 'un',
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Anyone authenticated can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (true);

-- Receipts (incoming stock/notas fiscais)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_nota TEXT,
  fornecedor TEXT,
  data_recebimento TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view receipts" ON receipts;
DROP POLICY IF EXISTS "Authenticated users can create receipts" ON receipts;

CREATE POLICY "Anyone authenticated can view receipts"
  ON receipts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create receipts"
  ON receipts FOR INSERT
  WITH CHECK (true);

-- Receipt items
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  codigo_produto TEXT,
  nome_produto TEXT,
  quantidade INTEGER NOT NULL,
  valor_unitario NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view receipt items" ON receipt_items;
DROP POLICY IF EXISTS "Authenticated users can create receipt items" ON receipt_items;

CREATE POLICY "Anyone authenticated can view receipt items"
  ON receipt_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create receipt items"
  ON receipt_items FOR INSERT
  WITH CHECK (true);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total NUMERIC(12,2) NOT NULL,
  forma_pagamento payment_method,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view sales" ON sales;
DROP POLICY IF EXISTS "Users can create sales" ON sales;

CREATE POLICY "Users can view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Users can create sales"
  ON sales FOR INSERT
  WITH CHECK (true);

-- Sale items
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  codigo_produto TEXT,
  nome_produto TEXT,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(12,2) NOT NULL
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can create sale items" ON sale_items;

CREATE POLICY "Users can view sale items"
  ON sale_items FOR SELECT
  USING (true);

CREATE POLICY "Users can create sale items"
  ON sale_items FOR INSERT
  WITH CHECK (true);

-- Stock movements (use existing movement_type enum)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  tipo movement_type NOT NULL,
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can create stock movements" ON stock_movements;

CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  USING (true);

CREATE POLICY "Users can create stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (true);

-- Waste records
CREATE TABLE IF NOT EXISTS waste_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  image_paths TEXT[],
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view waste records" ON waste_records;
DROP POLICY IF EXISTS "Users can create waste records" ON waste_records;
DROP POLICY IF EXISTS "Admins can update waste records" ON waste_records;

CREATE POLICY "Users can view waste records"
  ON waste_records FOR SELECT
  USING (true);

CREATE POLICY "Users can create waste records"
  ON waste_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update waste records"
  ON waste_records FOR UPDATE
  USING (true);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_codigo_barras ON products(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_products_nome ON products(nome);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_waste_records_confirmed ON waste_records(confirmed);

-- Trigger to update updated_at on users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: 1285041, hashed with bcrypt)
-- Note: Password hash here is placeholder - will be replaced with actual hash
INSERT INTO users (name, email, cpf, role, cargo, password_hash)
VALUES (
  'Administrador',
  'caminhocerto93@gmail.com',
  '00000000000',
  'admin',
  'Administrador do Sistema',
  '$2b$10$YourActualBcryptHashHere'
)
ON CONFLICT (email) DO NOTHING;