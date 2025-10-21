import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createEmployeeUser() {
  try {
    console.log('🔄 Conectando ao Supabase remoto...');
    console.log('URL:', supabaseUrl);

    // Dados do funcionário
    const userData = {
      cpf: '10533219531',
      password: '1285041',
      name: 'Funcionário Teste',
      role: 'employee',
      position: 'Atendente'
    };

    console.log('🔄 Gerando hash da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    console.log('✅ Hash gerado:', passwordHash);

    console.log('🔄 Verificando se usuário já existe...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', userData.cpf)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar usuário existente:', checkError);
      return;
    }

    if (existingUser) {
      console.log('⚠️ Usuário já existe:', existingUser);
      console.log('🔄 Atualizando senha...');
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('cpf', userData.cpf)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        return;
      }

      console.log('✅ Usuário atualizado com sucesso:', updatedUser);
      return;
    }

    console.log('🔄 Criando novo usuário...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        cpf: userData.cpf,
        password_hash: passwordHash,
        name: userData.name,
        role: userData.role,
        position: userData.position
      }])
      .select();

    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError);
      console.error('Detalhes:', insertError.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso no Supabase remoto!');
    console.log('Dados:', newUser);

    // Testar a senha
    console.log('🔄 Testando validação da senha...');
    const isValid = await bcrypt.compare(userData.password, passwordHash);
    console.log('✅ Senha válida:', isValid);

    console.log('\n🎉 Usuário funcionário criado com sucesso!');
    console.log('📋 Credenciais para login:');
    console.log('CPF:', userData.cpf);
    console.log('Senha:', userData.password);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createEmployeeUser();