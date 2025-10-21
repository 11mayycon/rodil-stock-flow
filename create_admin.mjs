import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('URL do Supabase ou chave de serviço não definida. Verifique seu arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = 'maiconsillva2525@gmail.com';
const password = 'dbaWvAWH4*PG%p6';
const fullName = 'Administrador';

async function createAdmin() {
  // 1. Verificar se o usuário já existe na tabela users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Erro ao verificar usuário existente:', checkError.message);
    return;
  }

  if (existingUser) {
    console.log('Usuário já existe:', existingUser);
    // Verificar se já é admin
    if (existingUser.role === 'admin') {
      console.log('Usuário já é administrador. Nenhuma ação necessária.');
      return;
    } else {
      // Atualizar para admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Erro ao atualizar usuário para admin:', updateError.message);
        return;
      }
      console.log('Usuário atualizado para administrador com sucesso!');
      return;
    }
  }

  // 2. Criar o usuário na autenticação (só se não existir)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Marcar o e-mail como confirmado
  });

  if (authError) {
    console.error('Erro ao criar usuário na autenticação:', authError.message);
    return;
  }

  const user = authData.user;
  console.log('Usuário criado na autenticação com sucesso:', user.id);

  // 3. Inserir o perfil do usuário com a função de admin
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert([
      {
        id: user.id,
        name: fullName,
        email: email,
        role: 'admin',
      },
    ]);

  if (profileError) {
    console.error('Erro ao criar perfil do usuário:', profileError.message);
    // Opcional: excluir o usuário da autenticação se a criação do perfil falhar
    await supabase.auth.admin.deleteUser(user.id);
    console.log('Usuário de autenticação revertido devido a erro na criação do perfil.');
    return;
  }

  console.log('Administrador criado com sucesso!');
  console.log('Email:', email);
  console.log('ID do usuário:', user.id);
}

createAdmin();