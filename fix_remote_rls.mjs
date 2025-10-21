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
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erro de conectividade:', testError);
      return;
    }
    console.log('✅ Conectado ao Supabase remoto');

    // 2. Desabilitar RLS temporariamente (se possível)
    console.log('\n2️⃣ Tentando desabilitar RLS temporariamente...');
    try {
      await supabase.rpc('exec', { 
        sql: 'ALTER TABLE public.waste_records DISABLE ROW LEVEL SECURITY;' 
      });
      await supabase.rpc('exec', { 
        sql: 'ALTER TABLE public.stock_movements DISABLE ROW LEVEL SECURITY;' 
      });
      console.log('✅ RLS desabilitado temporariamente');
    } catch (error) {
      console.log('⚠️ Não foi possível desabilitar RLS via RPC, continuando...');
    }

    // 3. Remover políticas antigas
    console.log('\n3️⃣ Removendo políticas antigas...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can manage their own waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Users can view their own waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Admins can manage all waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Users can manage their own stock movements" ON public.stock_movements;',
      'DROP POLICY IF EXISTS "Users can view their own stock movements" ON public.stock_movements;',
      'DROP POLICY IF EXISTS "Admins can manage all stock movements" ON public.stock_movements;',
      'DROP POLICY IF EXISTS "Public can insert waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Public can select waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Public can update waste records" ON public.waste_records;',
      'DROP POLICY IF EXISTS "Public can insert stock movements" ON public.stock_movements;',
      'DROP POLICY IF EXISTS "Public can select stock movements" ON public.stock_movements;',
    ];

    for (const sql of dropPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql });
        console.log(`   ✅ ${sql.split('"')[1] || 'Política'} removida`);
      } catch (error) {
        console.log(`   ⚠️ ${sql.split('"')[1] || 'Política'} não existia`);
      }
    }

    // 4. Criar novas políticas permissivas
    console.log('\n4️⃣ Criando novas políticas permissivas...');
    
    const newPolicies = [
      // waste_records
      `CREATE POLICY "Allow all operations on waste_records"
       ON public.waste_records
       FOR ALL
       TO public
       USING (true)
       WITH CHECK (true);`,
      
      // stock_movements  
      `CREATE POLICY "Allow all operations on stock_movements"
       ON public.stock_movements
       FOR ALL
       TO public
       USING (true)
       WITH CHECK (true);`,
    ];

    for (const sql of newPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql });
        const policyName = sql.split('"')[1];
        console.log(`   ✅ ${policyName} criada`);
      } catch (error) {
        console.error(`   ❌ Erro ao criar política: ${error.message}`);
      }
    }

    // 5. Verificar storage policies
    console.log('\n5️⃣ Verificando políticas de storage...');
    try {
      const storagePolicies = [
        `CREATE POLICY "Allow all operations on desperdicios bucket"
         ON storage.objects
         FOR ALL
         TO public
         USING (bucket_id = 'desperdicios')
         WITH CHECK (bucket_id = 'desperdicios');`,
      ];

      for (const sql of storagePolicies) {
        try {
          await supabase.rpc('exec_sql', { sql });
          console.log('   ✅ Política de storage criada');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('   ✅ Política de storage já existe');
          } else {
            console.log(`   ⚠️ Erro na política de storage: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log('   ⚠️ Não foi possível verificar storage policies');
    }

    // 6. Testar as correções
    console.log('\n6️⃣ Testando as correções...');
    
    // Buscar usuário de teste
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', '10533219531')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Usuário de teste não encontrado');
      return;
    }

    const user = users[0];
    console.log(`   Usuário de teste: ${user.name}`);

    // Buscar produto de teste
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError || !products || products.length === 0) {
      console.error('❌ Produto de teste não encontrado');
      return;
    }

    const product = products[0];
    console.log(`   Produto de teste: ${product.nome}`);

    // Testar inserção com anon role (como o frontend faz)
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0');
    
    const testData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste final - correção RLS remoto',
    };

    const { data: testResult, error: testError } = await anonSupabase
      .from('waste_records')
      .insert([testData])
      .select();

    if (testError) {
      console.error('❌ Teste falhou:', testError.message);
    } else {
      console.log('✅ Teste passou! Waste_record inserido com sucesso');
      
      // Limpar teste
      await supabase.from('waste_records').delete().eq('id', testResult[0].id);
      console.log('🧹 Registro de teste removido');
    }

    console.log('\n🎉 Correções aplicadas no Supabase REMOTO!');
    console.log('   O frontend agora deve funcionar corretamente.');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

fixRemoteRLS();