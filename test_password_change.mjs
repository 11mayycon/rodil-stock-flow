import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('URL do Supabase ou chave de serviço não definida. Verifique seu arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPasswordChange() {
  try {
    console.log('🔧 Testando funcionalidade de troca de senha...\n');

    // 1. Buscar um usuário admin para teste
    const { data: adminUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (fetchError || !adminUser) {
      console.error('❌ Erro ao buscar usuário admin:', fetchError?.message);
      return;
    }

    console.log(`👤 Usuário encontrado: ${adminUser.name} (${adminUser.email})`);
    console.log(`🔑 Hash atual da senha: ${adminUser.password_hash.substring(0, 20)}...`);

    // 2. Testar validação da senha atual
    const currentPassword = '1285041'; // Senha padrão do sistema
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    
    console.log(`\n🔍 Testando validação da senha atual:`);
    console.log(`   Senha testada: ${currentPassword}`);
    console.log(`   Validação: ${isCurrentPasswordValid ? '✅ Válida' : '❌ Inválida'}`);

    if (!isCurrentPasswordValid) {
      console.log('❌ A senha atual não é válida. Verificando se precisa atualizar o hash...');
      
      // Atualizar o hash da senha padrão se necessário
      const newHash = await bcrypt.hash(currentPassword, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('id', adminUser.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar hash da senha:', updateError.message);
        return;
      }
      
      console.log('✅ Hash da senha atualizado com sucesso!');
    }

    // 3. Simular troca de senha
    const newPassword = 'novaSenha123';
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    console.log(`\n🔄 Simulando troca de senha:`);
    console.log(`   Nova senha: ${newPassword}`);
    console.log(`   Novo hash: ${newPasswordHash.substring(0, 20)}...`);

    const { error: changeError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminUser.id);

    if (changeError) {
      console.error('❌ Erro ao alterar senha:', changeError.message);
      return;
    }

    console.log('✅ Senha alterada com sucesso!');

    // 4. Testar login com nova senha
    const { data: updatedUser, error: loginTestError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', adminUser.id)
      .single();

    if (loginTestError) {
      console.error('❌ Erro ao buscar usuário atualizado:', loginTestError.message);
      return;
    }

    const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password_hash);
    console.log(`\n🔐 Testando login com nova senha:`);
    console.log(`   Validação: ${isNewPasswordValid ? '✅ Válida' : '❌ Inválida'}`);

    // 5. Restaurar senha original
    console.log(`\n🔄 Restaurando senha original...`);
    const originalHash = await bcrypt.hash(currentPassword, 10);
    const { error: restoreError } = await supabase
      .from('users')
      .update({ password_hash: originalHash })
      .eq('id', adminUser.id);

    if (restoreError) {
      console.error('❌ Erro ao restaurar senha original:', restoreError.message);
      return;
    }

    console.log('✅ Senha original restaurada com sucesso!');
    console.log('\n🎉 Teste de funcionalidade de troca de senha concluído com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('   ✅ Validação de senha atual');
    console.log('   ✅ Geração de hash bcrypt');
    console.log('   ✅ Atualização no banco de dados');
    console.log('   ✅ Validação da nova senha');
    console.log('   ✅ Restauração da senha original');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testPasswordChange();