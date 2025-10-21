import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendAuth() {
  try {
    console.log('🔍 Simulando exatamente o processo de login do frontend...\n');

    const cpf = '10533219531';
    const password = '1285041';
    const isAdmin = false;

    console.log('1️⃣ Executando login (simulando AuthContext.login)...');
    
    // Simular exatamente o código do AuthContext
    let query = supabase
      .from('users')
      .select('*')
      .eq('blocked', false)
      .limit(1);

    // Admin login usa email, funcionário usa CPF
    if (isAdmin) {
      query = query.eq('email', cpf);
    } else {
      query = query.eq('cpf', cpf);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('❌ Erro na query:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Credenciais inválidas - usuário não encontrado');
      return;
    }

    const userData = users[0];
    console.log('✅ Usuário encontrado:', userData.name);

    // Validar senha
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);

    if (!isValidPassword) {
      console.log('❌ Credenciais inválidas - senha incorreta');
      return;
    }

    console.log('✅ Senha válida');

    // Criar objeto userInfo como no AuthContext
    const userInfo = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      cargo: userData.cargo,
    };
    
    console.log('✅ UserInfo criado:', userInfo);

    // Simular localStorage (como seria no frontend)
    console.log('✅ Salvando no localStorage (simulado)');
    const savedUserData = JSON.stringify(userInfo);
    console.log('   Dados salvos:', savedUserData);

    console.log('\n2️⃣ Simulando uso do user context no componente Desperdicio...');
    
    // Simular o que acontece quando o componente Desperdicio usa useAuth()
    const user = userInfo; // Como seria retornado pelo useAuth()
    const isAdminUser = user?.role === 'admin';
    
    console.log(`   user.id: ${user.id}`);
    console.log(`   user.name: ${user.name}`);
    console.log(`   user.role: ${user.role}`);
    console.log(`   isAdmin: ${isAdminUser}`);

    console.log('\n3️⃣ Testando inserção de waste_record com user.id...');
    
    // Buscar produto para teste
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError || !products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }

    const product = products[0];
    console.log(`   Produto: ${product.nome}`);

    // Simular exatamente o que acontece no handleSubmit do Desperdicio
    const wasteData = {
      product_id: product.id,
      user_id: user?.id, // Exatamente como no código
      quantidade: 1,
      motivo: 'Teste frontend debug',
    };

    console.log('   Dados para inserção:', wasteData);
    console.log(`   user?.id está definido: ${user?.id ? '✅' : '❌'}`);

    const { data: wasteResult, error: wasteError } = await supabase
      .from('waste_records')
      .insert([wasteData])
      .select();

    if (wasteError) {
      console.error('❌ Erro ao inserir waste_record:', wasteError);
      console.error('   Message:', wasteError.message);
      console.error('   Code:', wasteError.code);
      
      // Verificar se é problema de RLS
      if (wasteError.message.includes('row-level security')) {
        console.log('\n🔍 Problema de RLS detectado!');
        console.log('   Verificando se user_id é válido...');
        
        // Verificar se o user_id existe na tabela users
        const { data: userCheck, error: userCheckError } = await supabase
          .from('users')
          .select('id, name')
          .eq('id', user.id);

        if (userCheckError) {
          console.error('❌ Erro ao verificar user_id:', userCheckError);
        } else if (!userCheck || userCheck.length === 0) {
          console.error('❌ user_id não existe na tabela users!');
        } else {
          console.log('✅ user_id existe na tabela users:', userCheck[0].name);
        }
      }
    } else {
      console.log('✅ Waste_record inserido com sucesso!');
      console.log('   ID:', wasteResult[0].id);
      
      // Limpar teste
      await supabase.from('waste_records').delete().eq('id', wasteResult[0].id);
      console.log('🧹 Registro de teste removido');
    }

    console.log('\n📊 Resumo da simulação frontend:');
    console.log(`   ✅ Login simulado com sucesso`);
    console.log(`   ✅ UserInfo criado corretamente`);
    console.log(`   ✅ user.id disponível: ${user.id}`);
    console.log(`   ${wasteError ? '❌' : '✅'} Inserção de waste_record`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

debugFrontendAuth();