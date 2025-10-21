import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('URL do Supabase ou chave de serviço não definida. Verifique seu arquivo .env');
  process.exit(1);
}

const email = 'maiconsillva2525@gmail.com';
const password = 'dbaWvAWH4*PG%p6';
const fullName = 'Administrador';

async function createAdminViaAPI() {
  try {
    console.log('Criando usuário administrador via API REST...');
    
    // 1. Criar o usuário na autenticação usando a API REST
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName
        }
      })
    });

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('Erro ao criar usuário na autenticação:', errorText);
      return;
    }

    const userData = await createUserResponse.json();
    const userId = userData.id;
    console.log('Usuário criado na autenticação com sucesso:', userId);

    // 2. Inserir o perfil do usuário na tabela users
    const insertProfileResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: userId,
        name: fullName,
        email: email,
        role: 'admin'
      })
    });

    if (!insertProfileResponse.ok) {
      const errorText = await insertProfileResponse.text();
      console.error('Erro ao criar perfil do usuário:', errorText);
      
      // Tentar excluir o usuário da autenticação se a criação do perfil falhar
      try {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          }
        });
        console.log('Usuário de autenticação revertido devido a erro na criação do perfil.');
      } catch (deleteError) {
        console.error('Erro ao reverter usuário de autenticação:', deleteError.message);
      }
      return;
    }

    const profileData = await insertProfileResponse.json();
    console.log('Perfil do usuário criado com sucesso:', profileData);
    console.log('✅ Administrador criado com sucesso!');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    console.log(`Nome: ${fullName}`);
    console.log(`Role: admin`);

  } catch (error) {
    console.error('Erro geral ao criar administrador:', error.message);
  }
}

createAdminViaAPI();