import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Usar as mesmas credenciais que o frontend usa
const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRemoteSupabase() {
  try {
    console.log('🔍 Testando Supabase REMOTO (mesmo que o frontend usa)...\n');
    console.log(`URL: ${supabaseUrl}`);

    const cpf = '10533219531';
    const password = '1285041';

    // 1. Verificar se o usuário existe no Supabase remoto
    console.log('1️⃣ Verificando se o usuário existe no Supabase remoto...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .eq('blocked', false);

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      console.error('   Message:', userError.message);
      console.error('   Code:', userError.code);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Usuário não encontrado no Supabase remoto');
      console.log('   Isso explica o erro! O usuário existe apenas no Supabase local.');
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado no Supabase remoto:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Role: ${user.role}`);

    // 2. Verificar senha
    console.log('\n2️⃣ Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`   Senha válida: ${isValidPassword ? '✅' : '❌'}`);

    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      return;
    }

    // 3. Testar inserção de waste_record
    console.log('\n3️⃣ Testando inserção de waste_record no Supabase remoto...');
    
    // Buscar produto
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError) {
      console.error('❌ Erro ao buscar produtos:', productError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado no Supabase remoto');
      return;
    }

    const product = products[0];
    console.log(`   Produto encontrado: ${product.nome}`);

    // Tentar inserir waste_record
    const wasteData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste remoto - debug CPF',
    };

    const { data: wasteResult, error: wasteError } = await supabase
      .from('waste_records')
      .insert([wasteData])
      .select();

    if (wasteError) {
      console.error('❌ Erro ao inserir waste_record no Supabase remoto:', wasteError);
      console.error('   Message:', wasteError.message);
      console.error('   Code:', wasteError.code);
      console.error('   Hint:', wasteError.hint);
      
      if (wasteError.message.includes('row-level security')) {
        console.log('\n🔍 Erro de RLS no Supabase remoto!');
        console.log('   As políticas RLS no Supabase remoto podem estar diferentes do local.');
      }
    } else {
      console.log('✅ Waste_record inserido com sucesso no Supabase remoto!');
      
      // Limpar teste
      await supabase.from('waste_records').delete().eq('id', wasteResult[0].id);
      console.log('🧹 Registro de teste removido');
    }

    console.log('\n📊 Diagnóstico:');
    console.log('   O frontend está configurado para usar o Supabase REMOTO');
    console.log('   Todos os nossos testes foram feitos no Supabase LOCAL');
    console.log('   Por isso funcionava nos testes mas não no frontend!');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testRemoteSupabase();