import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmployeeUser() {
  try {
    console.log('🔧 Criando usuário funcionário...\n');

    const userData = {
      name: 'Funcionário Teste',
      email: 'funcionario@teste.com',
      cpf: '10533219531',
      role: 'employee',
      cargo: 'Operador de Caixa',
      password: '1285041'
    };

    // Hash da senha
    const passwordHash = await bcrypt.hash(userData.password, 10);
    console.log(`🔑 Hash da senha gerado: ${passwordHash.substring(0, 20)}...`);

    // Inserir usuário no banco
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        role: userData.role,
        cargo: userData.cargo,
        password_hash: passwordHash,
        blocked: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`👤 ID: ${data.id}`);
    console.log(`👤 Nome: ${data.name}`);
    console.log(`📧 Email: ${data.email}`);
    console.log(`🆔 CPF: ${data.cpf}`);
    console.log(`👔 Cargo: ${data.cargo}`);
    console.log(`🔐 Senha: ${userData.password}`);

    // Testar validação da senha
    console.log('\n🔍 Testando validação da senha...');
    const isPasswordValid = await bcrypt.compare(userData.password, data.password_hash);
    console.log(`Validação: ${isPasswordValid ? '✅ Válida' : '❌ Inválida'}`);

    console.log('\n🎉 Usuário funcionário criado e testado com sucesso!');
    console.log('\n📋 Credenciais para login:');
    console.log(`   CPF: ${userData.cpf}`);
    console.log(`   Senha: ${userData.password}`);

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

// Executar criação
createEmployeeUser();