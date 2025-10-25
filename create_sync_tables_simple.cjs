const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSyncTables() {
  console.log('Criando tabelas de sincronização...');
  
  try {
    // Criar tabela sincronizacoes
    const { data: syncData, error: syncError } = await supabase
      .from('sincronizacoes')
      .select('*')
      .limit(1);
    
    if (syncError && syncError.code === 'PGRST116') {
      console.log('Tabela sincronizacoes não existe, precisa ser criada via SQL');
    } else {
      console.log('Tabela sincronizacoes já existe');
    }
    
    // Criar tabela sincronizacao_pendente
    const { data: pendingData, error: pendingError } = await supabase
      .from('sincronizacao_pendente')
      .select('*')
      .limit(1);
    
    if (pendingError && pendingError.code === 'PGRST116') {
      console.log('Tabela sincronizacao_pendente não existe, precisa ser criada via SQL');
    } else {
      console.log('Tabela sincronizacao_pendente já existe');
    }
    
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  }
}

createSyncTables();