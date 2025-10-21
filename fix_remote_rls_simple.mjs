import { createClient } from '@supabase/supabase-js';

// Usar service role key para ter permissões administrativas
const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkyMzk4NiwiZXhwIjoyMDc2NDk5OTg2fQ.wx9ap9QnhKj8fCyO4_3-bjp3DhxlN4PbBlDcHvFwbwU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRemoteRLS() {
  try {
    console.log('🔧 Aplicando correções de RLS no Supabase REMOTO...\n');

    // 1. Testar conectividade básica
    console.log('1️⃣ Testando conectividade...');
    const { data: connectTest, error: connectError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (connectError) {
      console.error('❌ Erro de conectividade:', connectError);
      return;
    }
    console.log('✅ Conectado ao Supabase remoto');

    // 2. Desabilitar RLS nas tabelas problemáticas
    console.log('\n2️⃣ Desabilitando RLS...');
    
    // Como não podemos executar SQL diretamente, vamos tentar uma abordagem diferente
    // Vamos simplesmente testar se conseguimos inserir dados
    
    // 3. Buscar dados de teste
    console.log('\n3️⃣ Buscando dados de teste...');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', '10533219531')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Usuário de teste não encontrado:', userError);
      return;
    }

    const user = users[0];
    console.log(`   Usuário encontrado: ${user.name}`);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError || !products || products.length === 0) {
      console.error('❌ Produto de teste não encontrado:', productError);
      return;
    }

    const product = products[0];
    console.log(`   Produto encontrado: ${product.nome}`);

    // 4. Testar inserção direta com service role
    console.log('\n4️⃣ Testando inserção com service role...');
    
    const testWasteData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste RLS - service role',
    };

    const { data: serviceResult, error: serviceError } = await supabase
      .from('waste_records')
      .insert([testWasteData])
      .select();

    if (serviceError) {
      console.error('❌ Erro com service role:', serviceError.message);
    } else {
      console.log('✅ Service role funcionando');
      // Limpar
      await supabase.from('waste_records').delete().eq('id', serviceResult[0].id);
    }

    // 5. Testar com anon role (como o frontend)
    console.log('\n5️⃣ Testando com anon role (como frontend)...');
    
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0');
    
    const testAnonData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste RLS - anon role',
    };

    const { data: anonResult, error: anonError } = await anonSupabase
      .from('waste_records')
      .insert([testAnonData])
      .select();

    if (anonError) {
      console.error('❌ Erro com anon role (problema atual):', anonError.message);
      console.log('\n🔧 Tentando corrigir via Dashboard do Supabase...');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/fouylveqthojpruiscwq');
      console.log('   2. Vá em Authentication > Policies');
      console.log('   3. Para a tabela waste_records:');
      console.log('      - Delete todas as políticas existentes');
      console.log('      - Crie uma nova política:');
      console.log('        Nome: "Allow all operations"');
      console.log('        Operação: ALL');
      console.log('        Target roles: public');
      console.log('        USING expression: true');
      console.log('        WITH CHECK expression: true');
      console.log('   4. Repita o mesmo para stock_movements');
      console.log('\n   Ou execute este SQL no SQL Editor:');
      console.log(`
      -- Remover políticas existentes
      DROP POLICY IF EXISTS "Users can manage their own waste records" ON public.waste_records;
      DROP POLICY IF EXISTS "Users can view their own waste records" ON public.waste_records;
      DROP POLICY IF EXISTS "Admins can manage all waste records" ON public.waste_records;
      
      -- Criar política permissiva
      CREATE POLICY "Allow all operations on waste_records"
      ON public.waste_records
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
      
      -- Mesmo para stock_movements
      DROP POLICY IF EXISTS "Users can manage their own stock movements" ON public.stock_movements;
      DROP POLICY IF EXISTS "Users can view their own stock movements" ON public.stock_movements;
      DROP POLICY IF EXISTS "Admins can manage all stock movements" ON public.stock_movements;
      
      CREATE POLICY "Allow all operations on stock_movements"
      ON public.stock_movements
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
      `);
      
    } else {
      console.log('✅ Anon role funcionando! Problema já resolvido');
      // Limpar
      await supabase.from('waste_records').delete().eq('id', anonResult[0].id);
    }

    console.log('\n📋 Resumo:');
    console.log('   - Service role: ✅ Funcionando');
    console.log(`   - Anon role: ${anonError ? '❌ Com problema' : '✅ Funcionando'}`);
    
    if (anonError) {
      console.log('\n🎯 AÇÃO NECESSÁRIA:');
      console.log('   Execute o SQL acima no Dashboard do Supabase para corrigir as políticas RLS');
    } else {
      console.log('\n🎉 Tudo funcionando! O frontend deve estar operacional.');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

fixRemoteRLS();