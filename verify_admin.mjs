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

async function verifyAdmin() {
  console.log('Verificando administrador...');
  
  // Buscar o usuário na tabela users
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Erro ao buscar usuário:', error.message);
    return;
  }

  if (!user) {
    console.error('Usuário não encontrado!');
    return;
  }

  console.log('✅ Usuário encontrado:');
  console.log('ID:', user.id);
  console.log('Nome:', user.name);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Cargo:', user.cargo);
  console.log('Bloqueado:', user.blocked);
  console.log('Criado em:', user.created_at);
  console.log('Atualizado em:', user.updated_at);

  if (user.role === 'admin') {
    console.log('✅ Usuário tem privilégios de administrador!');
  } else {
    console.log('❌ Usuário NÃO tem privilégios de administrador!');
  }
}

verifyAdmin();