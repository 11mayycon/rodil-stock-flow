import bcrypt from 'bcryptjs';

async function testLoginHash() {
  try {
    console.log('🔍 Testando hash da senha do usuário...\n');

    const storedHash = '$2b$10$J3WMF5kb8wv1xxY6z4dvsO11iMS32JXFmARAf/AMLYUC8LSFsxB1W';
    const passwordToTest = '1285041';

    console.log(`🔑 Hash armazenado: ${storedHash}`);
    console.log(`🔐 Senha a testar: ${passwordToTest}`);

    // Testar validação
    const isValid = await bcrypt.compare(passwordToTest, storedHash);
    console.log(`\n✅ Resultado da validação: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

    if (!isValid) {
      console.log('\n🔧 Testando outras possibilidades...');
      
      // Testar com senha diferente
      const alternativePasswords = ['1285041e', '12850411', 'admin', 'password'];
      
      for (const altPassword of alternativePasswords) {
        const altValid = await bcrypt.compare(altPassword, storedHash);
        console.log(`   Testando "${altPassword}": ${altValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
      }
      
      console.log('\n🔄 Gerando novo hash para a senha correta...');
      const newHash = await bcrypt.hash(passwordToTest, 10);
      console.log(`   Novo hash: ${newHash}`);
      
      const newHashValid = await bcrypt.compare(passwordToTest, newHash);
      console.log(`   Validação do novo hash: ${newHashValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testLoginHash();