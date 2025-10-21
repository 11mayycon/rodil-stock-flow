import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
  try {
    console.log('🔍 Simulando processo de login do frontend...\n');

    const emailOrCpf = '10533219531';
    const password = '1285041';
    const isAdmin = false;

    console.log(`📝 Dados de entrada:`);
    console.log(`   CPF/Email: ${emailOrCpf}`);
    console.log(`   Senha: ${password}`);
    console.log(`   É Admin: ${isAdmin}`);

    // Simular exatamente o que acontece no AuthContext
    let query = supabase
      .from('users')
      .select('*')
      .eq('blocked', false)
      .limit(1);

    // Admin login usa email, funcionário usa CPF
    if (isAdmin) {
      query = query.eq('email', emailOrCpf);
    } else {
      query = query.eq('cpf', emailOrCpf);
    }

    console.log('\n🔍 Executando query no banco...');
    const { data: users, error } = await query;

    if (error) {
      console.error('❌ Erro na query:', error);
      return;
    }

    console.log(`📊 Resultado da query:`);
    console.log(`   Usuários encontrados: ${users ? users.length : 0}`);
    
    if (users && users.length > 0) {
      const userData = users[0];
      console.log(`   ID: ${userData.id}`);
      console.log(`   Nome: ${userData.name}`);
      console.log(`   CPF: ${userData.cpf}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Blocked: ${userData.blocked}`);
      console.log(`   Hash: ${userData.password_hash.substring(0, 20)}...`);

      // Testar validação da senha
      console.log('\n🔐 Testando validação da senha...');
      const isValidPassword = await bcrypt.compare(password, userData.password_hash);
      console.log(`   Resultado: ${isValidPassword ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

      if (!isValidPassword) {
        console.log('\n🔧 Testando outras senhas possíveis...');
        const testPasswords = ['1285041e', '12850411', 'admin', 'password', '1285041 '];
        
        for (const testPass of testPasswords) {
          const testResult = await bcrypt.compare(testPass, userData.password_hash);
          console.log(`   "${testPass}": ${testResult ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        }
      } else {
        console.log('\n🎉 Login seria bem-sucedido!');
        console.log('   Usuário seria autenticado e redirecionado para o dashboard.');
      }
    } else {
      console.log('❌ Nenhum usuário encontrado com essas credenciais');
    }

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
}

debugLogin();