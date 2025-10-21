import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserAuth() {
  try {
    console.log('🔍 Debugando autenticação do usuário com CPF 10533219531...\n');

    const cpf = '10533219531';
    const password = '1285041';

    // 1. Verificar se o usuário existe
    console.log('1️⃣ Verificando se o usuário existe...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .eq('blocked', false);

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Usuário não encontrado com CPF:', cpf);
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Blocked: ${user.blocked}`);

    // 2. Verificar senha
    console.log('\n2️⃣ Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`   Senha válida: ${isValidPassword ? '✅' : '❌'}`);

    if (!isValidPassword) {
      console.log('❌ Senha inválida, parando debug');
      return;
    }

    // 3. Simular inserção de waste_record como se fosse o frontend
    console.log('\n3️⃣ Simulando inserção de waste_record...');
    
    // Primeiro, buscar um produto para teste
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError || !products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado para teste');
      return;
    }

    const product = products[0];
    console.log(`   Produto para teste: ${product.nome} (ID: ${product.id})`);

    // Tentar inserir waste_record
    const wasteData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste de debug - CPF específico',
    };

    console.log('   Dados do waste_record:', wasteData);

    const { data: wasteResult, error: wasteError } = await supabase
      .from('waste_records')
      .insert([wasteData])
      .select();

    if (wasteError) {
      console.error('❌ Erro ao inserir waste_record:', wasteError);
      console.error('   Detalhes:', wasteError.message);
      console.error('   Código:', wasteError.code);
      console.error('   Hint:', wasteError.hint);
    } else {
      console.log('✅ Waste_record inserido com sucesso:', wasteResult[0].id);
      
      // Limpar o teste
      await supabase
        .from('waste_records')
        .delete()
        .eq('id', wasteResult[0].id);
      console.log('🧹 Registro de teste removido');
    }

    // 4. Verificar políticas RLS para este usuário
    console.log('\n4️⃣ Verificando políticas RLS...');
    
    // Testar SELECT
    const { data: selectTest, error: selectError } = await supabase
      .from('waste_records')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (selectError) {
      console.error('❌ Erro no SELECT:', selectError.message);
    } else {
      console.log(`✅ SELECT funcionando - ${selectTest.length} registros encontrados`);
    }

    // 5. Verificar se há algum problema com o contexto de autenticação
    console.log('\n5️⃣ Verificando contexto de autenticação...');
    console.log(`   User ID disponível: ${user.id ? '✅' : '❌'}`);
    console.log(`   User role: ${user.role}`);
    console.log(`   User não bloqueado: ${!user.blocked ? '✅' : '❌'}`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

debugUserAuth();