import { execSync } from 'child_process';

const email = 'caminhocerto93@gmail.com';
const password = '1285041';
const fullName = 'Jô Sousa';

try {
  // Usar o CLI do Supabase para criar o usuário
  const command = `npx supabase admin users create --email ${email} --password ${password}`;
  const output = execSync(command, { encoding: 'utf-8' });
  console.log('Usuário criado com sucesso:', output);

  // Obter o ID do usuário a partir da saída
  const userIdMatch = output.match(/User created: (\S+)/);
  if (userIdMatch && userIdMatch[1]) {
    const userId = userIdMatch[1];
    console.log('ID do usuário:', userId);

    // Inserir o perfil do usuário com a função de admin
    const insertCommand = `npx supabase rpc '{"name": "insert_user_profile", "params": {"user_id": "${userId}", "full_name": "${fullName}", "role": "admin"}}'`
    const insertOutput = execSync(insertCommand, { encoding: 'utf-8' });
    console.log('Perfil de administrador criado com sucesso:', insertOutput);
  } else {
    console.error('Não foi possível obter o ID do usuário a partir da saída do comando.');
  }
} catch (error) {
  console.error('Erro ao criar usuário administrador:', error.message);
}