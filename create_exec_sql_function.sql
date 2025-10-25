-- Criar função exec_sql para executar SQL dinâmico
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erro: ' || SQLERRM;
END;
$$;

-- Criar tabelas de sincronização se não existirem
CREATE TABLE IF NOT EXISTS sincronizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  dados JSONB NOT NULL,
  status TEXT DEFAULT 'sucesso',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sincronizacao_pendente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  dados JSONB NOT NULL,
  tentativas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sincronizacoes_tipo ON sincronizacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_sincronizacoes_created_at ON sincronizacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_sincronizacao_pendente_tipo ON sincronizacao_pendente(tipo);
CREATE INDEX IF NOT EXISTS idx_sincronizacao_pendente_created_at ON sincronizacao_pendente(created_at);

-- Habilitar RLS
ALTER TABLE sincronizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sincronizacao_pendente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem visualizar sincronizações"
  ON sincronizacoes FOR SELECT
  USING (true);

CREATE POLICY "Todos podem inserir sincronizações"
  ON sincronizacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem visualizar sincronizações pendentes"
  ON sincronizacao_pendente FOR SELECT
  USING (true);

CREATE POLICY "Todos podem inserir sincronizações pendentes"
  ON sincronizacao_pendente FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem deletar sincronizações pendentes"
  ON sincronizacao_pendente FOR DELETE
  USING (true);